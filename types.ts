export enum Genre {
    HIP_HOP = 'Hip-Hop',
    EDM = 'EDM',
    JAZZ = 'Jazz',
    TRAP = 'Trap',
    POP = 'Pop',
    CINEMATIC = 'Cinematic',
    LOFI = 'Lofi',
    RNB = 'R&B',
    FUNK = 'Funk',
    SOUL = 'Soul'
}

export enum DrumComplexity {
    SIMPLE = 'Simple',
    STANDARD = 'Standard',
    COMPLEX = 'Complex'
}

export enum ChordProgression {
    // Simple & Pop
    I_V_VI_IV = 'I-V-vi-IV',
    VI_IV_I_V = 'vi-IV-I-V',
    I_IV_V_IV = 'I-IV-V-IV',
    I_VI_IV_V = 'I-vi-IV-V',
    // Jazzy & Soulful
    II_V_I = 'ii-V-I',
    I_VI_II_V = 'I-vi-ii-V',
    III_VI_II_V = 'iii-vi-ii-V',
    I_II_V = 'I-ii-V',
    // Cinematic & Emotive
    I_V_IV_IV = 'i-V-iv-iv',
    VI_VII_I_I = 'VI-VII-i-i',
    I_VII_VI_V = 'i-VII-VI-V',
    IV_I_V_VI = 'IV-I-V-vi',
}

export enum MelodyInstrument {
    LEAD_SYNTH = 'Lead Synth',
    PIANO = 'Piano',
    GUITAR = 'Guitar',
    FLUTE = 'Flute'
}

export enum Scale {
    MAJOR = 'Major',
    MINOR_NATURAL = 'Natural Minor',
    MINOR_HARMONIC = 'Harmonic Minor',
    DORIAN = 'Dorian',
    PHRYGIAN = 'Phrygian',
    LYDIAN = 'Lydian',
    MIXOLYDIAN = 'Mixolydian',
    BLUES = 'Blues'
}

export enum MelodyStyle {
    FLOWING = 'Flowing',
    CHOPPY = 'Choppy',
    JAZZY = 'Jazzy',
    EXPERIMENTAL = 'Experimental'
}

export enum BassStyle {
    SIMPLE_ROOTS = 'Simple Root Notes',
    WALKING_BASS = 'Walking Bassline',
    FUNKY_SYNCOPATED = 'Funky Syncopated'
}

export enum ArpeggioStyle {
    UP = 'Up',
    DOWN = 'Down',
    UP_DOWN = 'Up-Down',
    RANDOM = 'Random'
}

export enum NoteDensity {
    LOW = 'Low (8th notes)',
    MEDIUM = 'Medium (16th notes)',
    HIGH = 'High (32nd notes)'
}

export type Key = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export interface NoteEvent {
    time: string;
    note: string;
    duration: string;
    velocity: number;
}

export interface ChordEvent {
    time: string;
    notes: string[];
    duration: string;
    velocity: number;
}

export interface DrumData {
    kick: NoteEvent[];
    snare: NoteEvent[];
    hihat: NoteEvent[];
}

export type ChordData = ChordEvent[];
export type MelodyData = NoteEvent[];
export type BassData = NoteEvent[];
export type LayersData = NoteEvent[];

export type GenerationParams = {
    genre: Genre;
    tempo: number;
    humanize: boolean;
    key: Key;
    lengthInBars: number;
    creativeSeed: number;
} & (
    | { type: 'drums'; drumComplexity: DrumComplexity; }
    | { type: 'chords'; chordProgression: ChordProgression; }
    | { type: 'melody'; scale: Scale; melodyInstrument: MelodyInstrument; melodyStyle: MelodyStyle; chords: ChordData | null }
    | { type: 'bass'; bassStyle: BassStyle; chords: ChordData | null }
    | { type: 'layers'; arpeggioStyle: ArpeggioStyle; noteDensity: NoteDensity; chords: ChordData | null }
);


export type TrackId = 
    | 'kick' | 'snare' | 'hihat' | 'full_drums' 
    | 'chords' 
    | 'melody' 
    | 'bass' 
    | 'layers';