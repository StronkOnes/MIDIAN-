import React, { useState } from 'react';
import { Genre, ChordProgression, DrumComplexity, Key, MelodyInstrument, Scale, MelodyStyle, ArpeggioStyle, NoteDensity, BassStyle } from '../types';
import { SettingsIcon, ChevronDownIcon, MusicIcon, BassIcon, LayersIcon, MelodyIcon } from './icons';
import CustomSlider from './CustomSlider';
import CustomSwitch from './CustomSwitch';

const AccordionSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-panel-bg/50 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left text-text-light font-bold focus:outline-none">
                <div className="flex items-center gap-3">
                    {icon}
                    <span>{title}</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 border-t border-control-border/50 space-y-4">{children}</div>}
        </div>
    );
};


interface ControlPanelProps {
    genre: Genre; setGenre: (g: Genre) => void;
    tempo: number; setTempo: (t: number) => void;
    humanize: boolean; setHumanize: (h: boolean) => void;
    selectedKey: Key; setKey: (k: Key) => void;
    keys: Key[]; genres: Genre[];
    loopLength: number; setLoopLength: (l: number) => void; loopLengths: number[];
    songBars: number; setSongBars: (s: number) => void; songLengths: number[];
    drumComplexity: DrumComplexity; setDrumComplexity: (d: DrumComplexity) => void; drumComplexities: DrumComplexity[];
    chordProgression: ChordProgression; setChordProgression: (c: ChordProgression) => void; chordProgressionsByCategory: Record<string, ChordProgression[]>;
    melodyInstrument: MelodyInstrument; setMelodyInstrument: (m: MelodyInstrument) => void; melodyInstruments: MelodyInstrument[];
    scale: Scale; setScale: (s: Scale) => void; scales: Scale[];
    melodyStyle: MelodyStyle; setMelodyStyle: (m: MelodyStyle) => void; melodyStyles: MelodyStyle[];
    bassStyle: BassStyle; setBassStyle: (b: BassStyle) => void; bassStyles: BassStyle[];
    arpeggioStyle: ArpeggioStyle; setArpeggioStyle: (a: ArpeggioStyle) => void; arpeggioStyles: ArpeggioStyle[];
    noteDensity: NoteDensity; setNoteDensity: (n: NoteDensity) => void; noteDensities: NoteDensity[];
    isDisabled: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { isDisabled } = props;

    return (
        <div className="bg-panel-bg p-4 rounded-lg shadow-lg h-full">
            <div className="flex items-center mb-4">
                <SettingsIcon className="w-6 h-6 mr-3 text-primary" />
                <h2 className="text-xl font-bold text-white">Controls</h2>
            </div>
            <div className="space-y-2">
                {/* --- Global Controls --- */}
                <AccordionSection title="Global Settings" icon={<SettingsIcon className="w-5 h-5 text-text-muted"/>}>
                    <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-text-muted mb-2">Genre</label>
                        <select id="genre" value={props.genre} onChange={(e) => props.setGenre(e.target.value as Genre)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                            {props.genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="key" className="block text-sm font-medium text-text-muted mb-2">Key</label>
                        <select id="key" value={props.selectedKey} onChange={(e) => props.setKey(e.target.value as Key)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                            {props.keys.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="loopLength" className="block text-sm font-medium text-text-muted mb-2">Loop Length (Bars)</label>
                        <select id="loopLength" value={props.loopLength} onChange={(e) => props.setLoopLength(parseInt(e.target.value))} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                            {props.loopLengths.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="songBars" className="block text-sm font-medium text-text-muted mb-2">Song Length (Bars)</label>
                        <select id="songBars" value={props.songBars} onChange={(e) => props.setSongBars(parseInt(e.target.value))} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                            {props.songLengths.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="tempo" className="block text-sm font-medium text-text-muted mb-2">Tempo ({props.tempo} BPM)</label>
                        <CustomSlider min={60} max={200} step={1} value={props.tempo} onChange={(e) => props.setTempo(parseInt(e.target.value))} disabled={isDisabled} />
                    </div>
                    <div>
                        <CustomSwitch label="Humanize Timing" enabled={props.humanize} setEnabled={props.setHumanize} disabled={isDisabled} />
                    </div>
                </AccordionSection>

                {/* --- Drums --- */}
                <AccordionSection title="Drums" icon={<MusicIcon className="w-5 h-5 text-text-muted"/>} defaultOpen={false}>
                    <label htmlFor="drum-complexity" className="block text-sm font-medium text-text-muted mb-2">Complexity</label>
                    <select id="drum-complexity" value={props.drumComplexity} onChange={(e) => props.setDrumComplexity(e.target.value as DrumComplexity)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                        {props.drumComplexities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </AccordionSection>

                {/* --- Chords --- */}
                <AccordionSection title="Chords" icon={<MusicIcon className="w-5 h-5 text-text-muted"/>} defaultOpen={false}>
                    <label htmlFor="chords" className="block text-sm font-medium text-text-muted mb-2">Progression</label>
                    <select id="chords" value={props.chordProgression} onChange={(e) => props.setChordProgression(e.target.value as ChordProgression)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                        {Object.entries(props.chordProgressionsByCategory).map(([category, progressions]) => (
                            <optgroup key={category} label={category} className="bg-panel-bg text-text-muted font-bold">
                                {progressions.map(p => <option key={p} value={p} className="bg-control-bg text-text-light font-normal">{p}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </AccordionSection>

                {/* --- Melody --- */}
                <AccordionSection title="Melody" icon={<MelodyIcon className="w-5 h-5 text-text-muted"/>} defaultOpen={false}>
                    <label className="block text-sm font-medium text-text-muted mb-2">Instrument</label>
                    <select value={props.melodyInstrument} onChange={e => props.setMelodyInstrument(e.target.value as MelodyInstrument)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                        {props.melodyInstruments.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <label className="block text-sm font-medium text-text-muted mt-4 mb-2">Scale</label>
                    <select value={props.scale} onChange={e => props.setScale(e.target.value as Scale)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                        {props.scales.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <label className="block text-sm font-medium text-text-muted mt-4 mb-2">Style</label>
                    <select value={props.melodyStyle} onChange={e => props.setMelodyStyle(e.target.value as MelodyStyle)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                        {props.melodyStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </AccordionSection>
                
                {/* --- Bass --- */}
                <AccordionSection title="Bass" icon={<BassIcon className="w-5 h-5 text-text-muted"/>} defaultOpen={false}>
                    <label className="block text-sm font-medium text-text-muted mb-2">Style</label>
                    <select value={props.bassStyle} onChange={e => props.setBassStyle(e.target.value as BassStyle)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                        {props.bassStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </AccordionSection>

                {/* --- Layers --- */}
                <AccordionSection title="Layers (Arp/Texture)" icon={<LayersIcon className="w-5 h-5 text-text-muted"/>} defaultOpen={false}>
                    <label className="block text-sm font-medium text-text-muted mb-2">Arpeggio Style</label>
                    <select value={props.arpeggioStyle} onChange={e => props.setArpeggioStyle(e.target.value as ArpeggioStyle)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                        {props.arpeggioStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <label className="block text-sm font-medium text-text-muted mt-4 mb-2">Note Density</label>
                    <select value={props.noteDensity} onChange={e => props.setNoteDensity(e.target.value as NoteDensity)} disabled={isDisabled} className="w-full bg-control-bg border border-control-border rounded-md py-2 px-3 text-text-light focus:ring-2 focus:ring-primary disabled:opacity-50">
                        {props.noteDensities.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </AccordionSection>
            </div>
        </div>
    );
};

export default ControlPanel;