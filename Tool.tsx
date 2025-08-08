import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    MembraneSynth,
    NoiseSynth,
    Filter,
    MetalSynth,
    Chorus,
    Reverb,
    PolySynth,
    Synth,
    MonoSynth,
    FeedbackDelay,
    PluckSynth,
    Part,
    Time,
    Transport,
    start,
    context
} from 'tone';
import ControlPanel from './components/ControlPanel';
import GenerationPanel from './components/GenerationPanel';
import DownloadPanel from './components/DownloadPanel';
import { generateMidiPattern } from './services/geminiService';
import { createMidiFile, createZipAndDownload } from './services/midiService';
import { Genre, ChordProgression, DrumData, ChordData, NoteEvent, ChordEvent, TrackId, DrumComplexity, Key, MelodyInstrument, Scale, MelodyStyle, ArpeggioStyle, NoteDensity, BassStyle, MelodyData, BassData, LayersData, GenerationParams } from './types';
import { GENRES, CHORD_PROGRESSIONS_BY_CATEGORY, DRUM_COMPLEXITIES, KEYS, MELODY_INSTRUMENTS, SCALES, MELODY_STYLES, ARPEGGIO_STYLES, NOTE_DENSITIES, BASS_STYLES, LOOP_LENGTHS, SONG_LENGTHS } from './constants';
import MidianLogo from './components/MidianLogo';


// --- Sanitization Utilities for Perfect Looping ---

/**
 * A robust function to sanitize musical events to ensure they fit perfectly within a loop.
 * It uses integer-based ticks for precision, preventing floating-point errors.
 * It validates event start times and truncates any duration that overflows the loop boundary.
 * @param events An array of NoteEvent or ChordEvent objects.
 * @param lengthInBars The total number of bars in the loop.
 * @returns A sanitized array of events that fit perfectly within the loop.
 */
const sanitizeNotesForLooping = <T extends NoteEvent | ChordEvent>(events: T[], lengthInBars: number): T[] => {
    if (!events || !Array.isArray(events)) return [];

    // The loop ends at the start of the bar *after* the last bar of the loop.
    // For a 4-bar loop (bars 0, 1, 2, 3), the end is at the start of bar 4, which is '4:0:0'.
    const loopEndTicks = Time(`${lengthInBars}:0:0`).toTicks();

    return events.map(event => {
        // Guard against malformed event data from the AI
        if (!event || typeof event.time !== 'string' || typeof event.duration !== 'string') {
            return null;
        }
        
        try {
            const eventStartTicks = Time(event.time).toTicks();
            
            // Discard events that start at or after the loop's end point.
            if (eventStartTicks >= loopEndTicks) {
                return null;
            }

            const eventDurationTicks = Time(event.duration).toTicks();

            // Truncate events that extend beyond the loop's end point.
            if (eventStartTicks + eventDurationTicks > loopEndTicks) {
                const newDurationTicks = loopEndTicks - eventStartTicks;
                
                // Discard events that have a resulting duration of zero or less.
                if (newDurationTicks <= 0) {
                    return null;
                }
                
                // Return a new event with the truncated duration, using ticks notation for precision.
                return { ...event, duration: `${newDurationTicks}i` };
            }
            
            // The event fits perfectly, return it as is.
            return event;

        } catch (e) {
            // If Tone.js cannot parse the time or duration string, discard the event.
            console.warn(`Could not parse event, discarding:`, event, e);
            return null;
        }
    }).filter((event): event is T => event !== null);
};


/**
 * Applies loop sanitization to the entire nested data structure received from the AI.
 * @param data The raw music data (DrumData, ChordData, etc.).
 * @param lengthInBars The total number of bars in the loop.
 * @returns A sanitized version of the music data.
 */
const sanitizeMusicData = (data: any, lengthInBars: number): any => {
    if (!data) return null;
    
    // Handle DrumData object which has nested arrays
    if (data.kick || data.snare || data.hihat) {
        return {
            kick: sanitizeNotesForLooping(data.kick || [], lengthInBars),
            snare: sanitizeNotesForLooping(data.snare || [], lengthInBars),
            hihat: sanitizeNotesForLooping(data.hihat || [], lengthInBars),
        };
    }
    
    // Handle flat event arrays (Chords, Melody, Bass, Layers)
    if (Array.isArray(data)) {
        return sanitizeNotesForLooping(data, lengthInBars);
    }
    
    return data; // Return as-is if the format is unexpected
};


const Tool: React.FC = () => {
    // --- Core Controls ---
    const [genre, setGenre] = useState<Genre>(Genre.HIP_HOP);
    const [tempo, setTempo] = useState<number>(120);
    const [humanize, setHumanize] = useState<boolean>(true);
    const [key, setKey] = useState<Key>('C');
    const [loopLength, setLoopLength] = useState<number>(4);
    const [songBars, setSongBars] = useState<number>(16);

    // --- Module-specific Controls ---
    const [drumComplexity, setDrumComplexity] = useState<DrumComplexity>(DrumComplexity.STANDARD);
    const [chordProgression, setChordProgression] = useState<ChordProgression>(ChordProgression.I_V_VI_IV);
    const [melodyInstrument, setMelodyInstrument] = useState<MelodyInstrument>(MelodyInstrument.LEAD_SYNTH);
    const [scale, setScale] = useState<Scale>(Scale.MAJOR);
    const [melodyStyle, setMelodyStyle] = useState<MelodyStyle>(MelodyStyle.FLOWING);
    const [bassStyle, setBassStyle] = useState<BassStyle>(BassStyle.SIMPLE_ROOTS);
    const [arpeggioStyle, setArpeggioStyle] = useState<ArpeggioStyle>(ArpeggioStyle.UP);
    const [noteDensity, setNoteDensity] = useState<NoteDensity>(NoteDensity.MEDIUM);
    
    // --- Loading States ---
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
        drums: false, chords: false, melody: false, bass: false, layers: false, all: false
    });
    
    // --- Data State ---
    const [drumData, setDrumData] = useState<DrumData | null>(null);
    const [chordData, setChordData] = useState<ChordData | null>(null);
    const [melodyData, setMelodyData] = useState<MelodyData | null>(null);
    const [bassData, setBassData] = useState<BassData | null>(null);
    const [layersData, setLayersData] = useState<LayersData | null>(null);

    // --- UI/Playback State ---
    const [selectedTracks, setSelectedTracks] = useState<Set<TrackId>>(new Set());
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [playbackLength, setPlaybackLength] = useState<number>(4);

    const synths = useRef<any>(null);

    useEffect(() => {
        // --- Studio-Quality Sound Design ---
        const kick = new MembraneSynth({ pitchDecay: 0.04, octaves: 6, oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 0.8, attackCurve: 'exponential' } }).toDestination();
        const snareBody = new MembraneSynth({ pitchDecay: 0.07, octaves: 5, oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.25, sustain: 0.01, release: 0.3 } });
        const snareNoise = new NoiseSynth({ noise: { type: 'white', playbackRate: 2 }, envelope: { attack: 0.001, decay: 0.15, sustain: 0.05, release: 0.2 } });
        const snareFilter = new Filter(1000, "highpass").toDestination();
        const snare = { body: snareBody.connect(snareFilter), noise: snareNoise.connect(snareFilter) };
        const hihatSynth = new MetalSynth({ envelope: { attack: 0.001, decay: 0.1, release: 0.1 }, harmonicity: 5.1, modulationIndex: 20, resonance: 2500, octaves: 1.5 }).toDestination();
        hihatSynth.frequency.value = 400; hihatSynth.volume.value = -12;
        
        const chorus = new Chorus(4, 2.5, 0.5).toDestination().start();
        const reverb = new Reverb({ decay: 2, wet: 0.25 }).toDestination();
        const chordSynth = new PolySynth(Synth, { oscillator: { type: 'fatsawtooth', count: 3, spread: 30 }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.4, release: 1.4, attackCurve: 'exponential' } }).connect(chorus).connect(reverb);
        chordSynth.volume.value = -8;

        const bassSynth = new MonoSynth({ oscillator: { type: "fatsine" }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.8 } }).toDestination();
        bassSynth.volume.value = -4;

        const melodyDelay = new FeedbackDelay("8n.", 0.3).toDestination();
        const melodySynth = new MonoSynth({ oscillator: {type: 'sawtooth'}, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 } }).connect(melodyDelay);
        melodySynth.volume.value = -10;

        const arpSynth = new PluckSynth({ attackNoise: 0.5, resonance: 0.98, dampening: 4000 }).toDestination();
        arpSynth.volume.value = -10;

        synths.current = { kick, snare, hihat: hihatSynth, chords: chordSynth, bass: bassSynth, melody: melodySynth, layers: arpSynth };
        
        return () => {
            if(synths.current) {
                Object.values(synths.current).forEach((synth: any) => {
                    if (synth.body && synth.noise) { synth.body.dispose(); synth.noise.dispose(); } 
                    else if (synth.dispose) { synth.dispose(); }
                });
            }
            chorus.dispose(); reverb.dispose(); snareFilter.dispose(); melodyDelay.dispose();
            Transport.stop(); Transport.cancel();
        };
    }, []);

    useEffect(() => {
        Transport.bpm.value = tempo;
    }, [tempo]);

    const handleGeneration = useCallback(async (params: GenerationParams, type: 'drums' | 'chords' | 'melody' | 'bass' | 'layers') => {
        if (context.state !== 'running') {
            await start();
        }
        setIsLoading(prev => ({ ...prev, [type]: true }));
        setError(null);
        try {
            // @ts-ignore
            const rawData = await generateMidiPattern(params);
            const dataKey = type;
            if (dataKey in rawData) {
                // @ts-ignore
                let content = rawData[dataKey];

                // Sanitize the data to ensure it loops perfectly
                content = sanitizeMusicData(content, params.lengthInBars);
                
                const sortable = Array.isArray(content) ? [...content] : { ...content };

                if(Array.isArray(sortable)) {
                    sortable.sort((a, b) => Time(a.time).toSeconds() - Time(b.time).toSeconds());
                } else if (typeof sortable === 'object' && sortable !== null) {
                    Object.keys(sortable).forEach(key => {
                        // @ts-ignore
                        if(Array.isArray(sortable[key])) {
                             // @ts-ignore
                            sortable[key].sort((a, b) => Time(a.time).toSeconds() - Time(b.time).toSeconds());
                        }
                    });
                }
                
                // Dynamically call the correct state setter
                const setterName = `set${dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}Data`;
                const stateSetters: Record<string, Function> = { setDrumsData: setDrumData, setChordsData: setChordData, setMelodyData: setMelodyData, setBassData: setBassData, setLayersData: setLayersData };
                if (stateSetters[setterName]) {
                    stateSetters[setterName](sortable);
                }

                const trackIds: TrackId[] = type === 'drums' ? ['kick', 'snare', 'hihat', 'full_drums'] : [type as TrackId];
                setSelectedTracks(prev => new Set([...prev, ...trackIds]));
                setPlaybackLength(params.lengthInBars);
                return sortable;
            } else {
                 throw new Error(`Invalid data format for ${type} received from AI.`);
            }
        } catch (e) {
            console.error(e);
            const message = e instanceof Error ? e.message : `Failed to generate ${type}. Please try again.`;
            setError(message);
            return null;
        } finally {
            setIsLoading(prev => ({ ...prev, [type]: false }));
        }
    }, []);

    const createParams = (type: GenerationParams['type'], lengthInBars: number, additionalParams: object = {}) => {
        return {
            type, genre, tempo, humanize, key, lengthInBars, creativeSeed: Math.random(), ...additionalParams
        } as GenerationParams;
    };
    
    const handleGenerateDrums = () => handleGeneration(createParams('drums', loopLength, { drumComplexity }), 'drums');
    const handleGenerateChords = () => handleGeneration(createParams('chords', loopLength, { chordProgression }), 'chords');
    const handleGenerateMelody = async () => {
        let currentChords = chordData;
        if (!currentChords) {
            currentChords = await handleGeneration(createParams('chords', loopLength, { chordProgression }), 'chords');
        }
        if (currentChords) {
            handleGeneration(createParams('melody', loopLength, { scale, melodyInstrument, melodyStyle, chords: currentChords }), 'melody');
        }
    };
    const handleGenerateBass = async () => {
        let currentChords = chordData;
        if (!currentChords) {
            currentChords = await handleGeneration(createParams('chords', loopLength, { chordProgression }), 'chords');
        }
        if (currentChords) {
            handleGeneration(createParams('bass', loopLength, { bassStyle, chords: currentChords }), 'bass');
        }
    };
    const handleGenerateLayers = async () => {
        let currentChords = chordData;
        if (!currentChords) {
            currentChords = await handleGeneration(createParams('chords', loopLength, { chordProgression }), 'chords');
        }
        if (currentChords) {
            handleGeneration(createParams('layers', loopLength, { arpeggioStyle, noteDensity, chords: currentChords }), 'layers');
        }
    };

    const handleGenerateAll = async () => {
        setIsLoading(prev => ({ ...prev, all: true }));
        setDrumData(null); setChordData(null); setMelodyData(null); setBassData(null); setLayersData(null);

        const newChords = await handleGeneration(createParams('chords', songBars, { chordProgression }), 'chords');

        if (newChords) {
            await Promise.all([
                handleGeneration(createParams('drums', songBars, { drumComplexity }), 'drums'),
                handleGeneration(createParams('bass', songBars, { bassStyle, chords: newChords }), 'bass'),
                handleGeneration(createParams('melody', songBars, { scale, melodyInstrument, melodyStyle, chords: newChords }), 'melody'),
                handleGeneration(createParams('layers', songBars, { arpeggioStyle, noteDensity, chords: newChords }), 'layers'),
            ]);
        } else {
            setError("Could not generate a full song because the required chord progression failed to generate.");
        }
        setIsLoading(prev => ({ ...prev, all: false }));
    };
    
    const schedulePlayback = useCallback(() => {
        Transport.cancel();
        
        // Ensure the loop length is correctly set on the transport for this specific playback instance
        Transport.loopEnd = `${playbackLength}m`;
        Transport.loop = true;

        if (drumData) {
            Object.entries(drumData).forEach(([instrument, notes]) => {
                if (!notes || notes.length === 0) return;
                if (instrument === 'snare') {
                    new Part((time, value: NoteEvent) => {
                        synths.current.snare.body.triggerAttackRelease("D3", value.duration, time, value.velocity * 0.8);
                        synths.current.snare.noise.triggerAttackRelease(value.duration, time, value.velocity);
                    }, notes).start(0);
                } else if (instrument === 'hihat') {
                    new Part((time, value: NoteEvent) => {
                        const decay = value.note.includes('G#') ? 0.3 : 0.1;
                        synths.current.hihat.envelope.decay = decay;
                        synths.current.hihat.triggerAttackRelease(value.note, value.duration, time, value.velocity);
                    }, notes).start(0);
                } else if (instrument === 'kick') {
                    new Part((time, value: NoteEvent) => {
                        synths.current.kick.triggerAttackRelease(value.note, value.duration, time, value.velocity);
                    }, notes).start(0);
                }
            });
        }
        if (chordData) {
            new Part((time, value: ChordEvent) => {
                synths.current.chords.triggerAttackRelease(value.notes, value.duration, time, value.velocity);
            }, chordData).start(0);
        }
        if (melodyData) {
            new Part((time, value: NoteEvent) => {
                synths.current.melody.triggerAttackRelease(value.note, value.duration, time, value.velocity);
            }, melodyData).start(0);
        }
        if (bassData) {
            new Part((time, value: NoteEvent) => {
                synths.current.bass.triggerAttackRelease(value.note, value.duration, time, value.velocity);
            }, bassData).start(0);
        }
        if (layersData) {
            new Part((time, value: NoteEvent) => {
                synths.current.layers.triggerAttackRelease(value.note, value.duration, time, value.velocity);
            }, layersData).start(0);
        }
    }, [drumData, chordData, melodyData, bassData, layersData, playbackLength]);

    const handlePlay = async () => {
        if (isPlaying) {
            Transport.pause(); setIsPlaying(false);
        } else {
            await start();
            if (Transport.state === 'paused') {
                Transport.start();
            } else {
                if (!drumData && !chordData && !melodyData && !bassData && !layersData) return;
                schedulePlayback(); Transport.start();
            }
            setIsPlaying(true);
        }
    };

    const handleDownload = () => {
        const filesToZip: { name: string; data: Uint8Array }[] = [];
        const allDrumNotes: NoteEvent[] = (drumData ? [...(drumData.kick || []), ...(drumData.snare || []), ...(drumData.hihat || [])] : []);

        const trackDataMap: { [key in TrackId]?: (NoteEvent | ChordEvent)[] } = {
            kick: drumData?.kick, snare: drumData?.snare, hihat: drumData?.hihat,
            full_drums: allDrumNotes, chords: chordData, melody: melodyData, bass: bassData, layers: layersData
        };
        const trackNameToMidiName: Record<string, string> = {
            kick: 'Kick', snare: 'Snare', hihat: 'Hi-Hat', full_drums: 'Drums_Full_Loop',
            chords: 'Chords', melody: 'Melody', bass: 'Bass', layers: 'Layers'
        };

        selectedTracks.forEach(trackId => {
            const notes = trackDataMap[trackId];
            if (notes && notes.length > 0) {
                const midiData = createMidiFile(notes, trackNameToMidiName[trackId] || 'track');
                if (midiData) filesToZip.push({ name: `${trackNameToMidiName[trackId]}_${tempo}bpm.mid`, data: midiData });
            }
        });
        
        if (filesToZip.length > 0) createZipAndDownload(filesToZip, `midi_kit_${tempo}bpm.zip`);
    };
    
    const hasGeneratableContent = !!drumData || !!chordData || !!melodyData || !!bassData || !!layersData;

    return (
        <div className="min-h-screen bg-background text-text-light flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <header className="w-full max-w-7xl mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MidianLogo className="h-8 w-auto" />
                </div>
                <a href="https://github.com/google/genai-patterns" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M9 19c-4.3 1.4 -4.3-2.5 -6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6.1 0-1.3-.5-2.4-1.3-3.2.1-.3.5-1.5-.1-3.2 0 0-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C3.3 5.4 2.2 5.7 2.2 5.7c-.6 1.7-.2 2.9-.1 3.2-.8.8-1.3 1.9-1.3 3.2 0 4.6 2.7 5.7 5.5 6-.6.5-1 1.4-1 2.8v4"/></svg>
                </a>
            </header>
            
            {error && <div className="w-full max-w-7xl bg-red-800/50 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-6" role="alert"><p>{error}</p></div>}
            
            <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <ControlPanel 
                        genre={genre} setGenre={setGenre}
                        tempo={tempo} setTempo={setTempo}
                        humanize={humanize} setHumanize={setHumanize}
                        selectedKey={key} setKey={setKey}
                        keys={KEYS}
                        genres={GENRES}
                        loopLength={loopLength} setLoopLength={setLoopLength} loopLengths={LOOP_LENGTHS}
                        songBars={songBars} setSongBars={setSongBars} songLengths={SONG_LENGTHS}
                        // Module Props
                        drumComplexity={drumComplexity} setDrumComplexity={setDrumComplexity} drumComplexities={DRUM_COMPLEXITIES}
                        chordProgression={chordProgression} setChordProgression={setChordProgression} chordProgressionsByCategory={CHORD_PROGRESSIONS_BY_CATEGORY}
                        melodyInstrument={melodyInstrument} setMelodyInstrument={setMelodyInstrument} melodyInstruments={MELODY_INSTRUMENTS}
                        scale={scale} setScale={setScale} scales={SCALES}
                        melodyStyle={melodyStyle} setMelodyStyle={setMelodyStyle} melodyStyles={MELODY_STYLES}
                        bassStyle={bassStyle} setBassStyle={setBassStyle} bassStyles={BASS_STYLES}
                        arpeggioStyle={arpeggioStyle} setArpeggioStyle={setArpeggioStyle} arpeggioStyles={ARPEGGIO_STYLES}
                        noteDensity={noteDensity} setNoteDensity={setNoteDensity} noteDensities={NOTE_DENSITIES}
                        isDisabled={Object.values(isLoading).some(v => v)}
                    />
                </div>
                <div className="lg:col-span-5">
                    <GenerationPanel
                        onGenerateDrums={handleGenerateDrums}
                        onGenerateChords={handleGenerateChords}
                        onGenerateMelody={handleGenerateMelody}
                        onGenerateBass={handleGenerateBass}
                        onGenerateLayers={handleGenerateLayers}
                        onGenerateAll={handleGenerateAll}
                        isLoading={isLoading}
                    />
                </div>
                <div className="lg:col-span-3">
                    <DownloadPanel
                        drumData={drumData}
                        chordData={chordData}
                        melodyData={melodyData}
                        bassData={bassData}
                        layersData={layersData}
                        selectedTracks={selectedTracks}
                        setSelectedTracks={setSelectedTracks}
                        isPlaying={isPlaying}
                        onPlayToggle={handlePlay}
                        onDownload={handleDownload}
                        isActionable={hasGeneratableContent}
                    />
                </div>
            </main>
        </div>
    );
};

export default Tool;