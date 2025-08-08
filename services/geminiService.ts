

import { GoogleGenAI, Type } from "@google/genai";
import { GenerationParams, DrumData, ChordData, MelodyData, BassData, LayersData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const createNoteEventSchema = (lengthInBars: number) => ({
    type: Type.OBJECT,
    properties: {
        time: { type: Type.STRING, description: `The start time of the note in Tone.js Transport Time format 'bar:quarter:sixteenth', covering a ${lengthInBars}-bar loop (e.g., from '0:0:0' to '${lengthInBars - 1}:3:3').` },
        note: { type: Type.STRING, description: "The MIDI note name, e.g., 'C4'." },
        duration: { type: Type.STRING, description: "The duration of the note in Tone.js notation, e.g., '8n', '16n'." },
        velocity: { type: Type.NUMBER, description: "The velocity of the note from 0.0 to 1.0. Use varied velocities for a human feel. A velocity of 0 should not be used." },
    },
    required: ["time", "note", "duration", "velocity"]
});

const createChordEventSchema = (lengthInBars: number) => ({
    type: Type.OBJECT,
    properties: {
        time: { type: Type.STRING, description: `The start time of the chord in Tone.js Transport Time format 'bar:quarter:sixteenth', covering a ${lengthInBars}-bar loop.` },
        notes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of MIDI note names for the chord, e.g., ['C4', 'E4', 'G4']." },
        duration: { type: Type.STRING, description: "The duration of the chord in Tone.js notation, e.g., '2n', '1m'." },
        velocity: { type: Type.NUMBER, description: "The velocity of the chord from 0.0 to 1.0. Vary velocity for expressiveness." },
    },
    required: ["time", "notes", "duration", "velocity"]
});

const createSchema = (key: string, itemSchema: any, isArray = true) => ({
    type: Type.OBJECT,
    properties: { [key]: isArray ? { type: Type.ARRAY, items: itemSchema } : itemSchema },
    required: [key]
});

export const generateMidiPattern = async (params: GenerationParams): Promise<{ drums: DrumData } | { chords: ChordData } | { melody: MelodyData } | { bass: BassData } | { layers: LayersData }> => {
    const { type, genre, tempo, humanize, key, lengthInBars, creativeSeed } = params;

    const basePrompt = `You are a virtuoso musician and world-class music producer AI. Your task is to generate a highly creative, musically sophisticated, and beautiful pattern.
    The output must be a valid JSON object strictly adhering to the provided schema. Do not include any explanatory text or markdown.

    Core Parameters:
    - Total Length: ${lengthInBars} bars in 4/4 time.
    - Genre: ${genre}
    - Tempo: ${tempo} BPM. This is crucial. Adapt the density and energy of your pattern to the tempo. Faster tempos should feel energetic; slower tempos should have more space and feel more relaxed.
    - Key: ${key}
    - Feel: ${humanize ? 'Humanized. Use subtle variations in timing (push/pull on the beat) and velocity to create a natural, organic groove.' : 'Quantized. All notes should be perfectly on the grid.'}
    - Creative Seed: ${creativeSeed}. Use this to ensure the generation is unique.

    CRITICAL LOOPING RULE: The pattern is for a ${lengthInBars}-bar loop. All 'time' values MUST be within this range. The 'time' format is 'bar:quarter:sixteenth', and the 'bar' index is 0-based.
    For a ${lengthInBars}-bar loop, this means valid bar indices are from 0 to ${lengthInBars - 1}.
    ABSOLUTELY NO event can have a 'time' value where the bar index is ${lengthInBars} or greater (e.g., no "${lengthInBars}:0:0" in a ${lengthInBars}-bar loop).
    The total duration of any event from its start 'time' must not extend beyond the exact end of the loop ('${lengthInBars}:0:0'). You must mathematically manage note durations near the end of the loop to ensure they are truncated and do not spill over. This is a strict, non-negotiable requirement.

    **MUST-FILL DURATION RULE:** The musical phrase MUST actively fill the entire ${lengthInBars}-bar duration. Do not leave long stretches of silence at the end. The pattern should feel rhythmically and harmonically complete and resolve naturally back to the beginning. The final notes should lead into the downbeat of the next loop, often by having an event that ends exactly on the loop boundary.

    Your generation should be inspiring and production-ready. Think about syncopation, ghost notes, and dynamic range.
    `;
    
    let specificPrompt = '';
    let schema: any;
    const noteSchema = createNoteEventSchema(lengthInBars);
    const chordSchemaForType = createChordEventSchema(lengthInBars);

    switch (type) {
        case 'drums':
            specificPrompt = `Generate a ${lengthInBars}-bar drum beat. Kick='C2', Snare='D2', Closed Hi-hat='F#2', Open Hi-hat='G#2'.
            - Complexity: ${params.drumComplexity}. For 'Complex', use syncopation, ghost notes on the snare, and varied hi-hat patterns (e.g., triplets, 16th note runs).
            The pattern must be a complete, loopable phrase that is the centerpiece of a track for the specified genre.`;
            schema = createSchema('drums', {
                type: Type.OBJECT,
                properties: {
                    kick: { type: Type.ARRAY, items: noteSchema, description: "Kick drum pattern using note 'C2'." },
                    snare: { type: Type.ARRAY, items: noteSchema, description: "Snare/clap pattern using note 'D2'." },
                    hihat: { type: Type.ARRAY, items: noteSchema, description: "Hi-hat pattern. Use 'F#2' for closed, 'G#2' for open." },
                },
                required: ["kick", "snare", "hihat"]
            }, false);
            break;
        case 'chords':
            specificPrompt = `Generate a ${lengthInBars}-bar chord progression for the roman numeral progression "${params.chordProgression}".
            - Voicings: Use rich, interesting voicings (e.g., 7ths, 9ths, 11ths, inversions) that are idiomatic for the genre.
            - Rhythm: Create a compelling, syncopated rhythm. Avoid placing all chords on the downbeat. Create a rhythmic pattern that a keyboardist or guitarist would actually play.`;
            schema = createSchema('chords', chordSchemaForType);
            break;
        case 'melody':
            specificPrompt = `Generate a ${lengthInBars}-bar lead melody for a ${params.melodyInstrument}.
            - Harmonic Context: This melody will be played over the following chord progression. It must be harmonically compatible. Chord Progression: ${JSON.stringify(params.chords)}
            - Scale: ${params.scale}. The melody must strictly adhere to the notes of this scale in the given key.
            - Style: ${params.melodyStyle}. Create a memorable, loopable, and expressive line. It should have a clear contour and use varied rhythms, note lengths, and rests.`;
            schema = createSchema('melody', noteSchema);
            break;
        case 'bass':
            specificPrompt = `Generate a ${lengthInBars}-bar bassline that provides a powerful foundation for the provided chord progression.
            - Harmonic Context: The bassline must follow the root motion of these chords: ${JSON.stringify(params.chords)}
            - Style: ${params.bassStyle}. It should be groovy and rhythmically interesting, locking in with a typical drum pattern for the genre.
              - For 'Simple', use primarily root notes, but with creative rhythmic placement.
              - For 'Walking', create a smooth, stepwise line connecting the chord roots.
              - For 'Funky', use heavy syncopation, rests, octaves, and chromatic passing tones.`;
            if (!params.chords) throw new Error("Bass generation requires a chord progression.");
            schema = createSchema('bass', noteSchema);
            break;
        case 'layers':
            specificPrompt = `Generate a ${lengthInBars}-bar textural layer (Arpeggio/Rhythmic Pad) to complement the provided chord progression.
            - Harmonic Context: The notes must be derived from these chords: ${JSON.stringify(params.chords)}
            - Arpeggio Style: ${params.arpeggioStyle}.
            - Note Density: ${params.noteDensity}. Create arpeggios or rhythmic patterns based on the chord notes.
            This layer should add energy and complexity without clashing with a potential lead melody. It should fill the sonic space elegantly.`;
            if (!params.chords) throw new Error("Layer generation requires a chord progression.");
            schema = createSchema('layers', noteSchema);
            break;
        default:
            throw new Error("Invalid generation type specified.");
    }

    const prompt = basePrompt + specificPrompt;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        return parsedJson;

    } catch (e) {
        console.error("Error generating content from Gemini:", e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        if (errorMessage.includes("400 Bad Request") && (errorMessage.includes("responseSchema") || errorMessage.includes("JSON"))) {
             throw new Error("The AI model returned an invalid structure. This can sometimes happen with complex requests. Please try again with slightly different settings.");
        }
        throw new Error(`The AI failed to generate a valid pattern for ${type}.`);
    }
};