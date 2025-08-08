import { Genre, ChordProgression, DrumComplexity, Key, MelodyInstrument, Scale, MelodyStyle, ArpeggioStyle, NoteDensity, BassStyle } from './types';

export const GENRES: Genre[] = [
    Genre.HIP_HOP,
    Genre.EDM,
    Genre.JAZZ,
    Genre.TRAP,
    Genre.POP,
    Genre.CINEMATIC,
    Genre.LOFI,
    Genre.RNB,
    Genre.FUNK,
    Genre.SOUL
];

export const DRUM_COMPLEXITIES: DrumComplexity[] = [
    DrumComplexity.SIMPLE,
    DrumComplexity.STANDARD,
    DrumComplexity.COMPLEX,
];

export const KEYS: Key[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const LOOP_LENGTHS: number[] = [2, 4, 8];
export const SONG_LENGTHS: number[] = [8, 16, 32, 64];

export const CHORD_PROGRESSIONS_BY_CATEGORY: Record<string, ChordProgression[]> = {
    'Simple & Popular': [
        ChordProgression.I_V_VI_IV,
        ChordProgression.VI_IV_I_V,
        ChordProgression.I_IV_V_IV,
        ChordProgression.I_VI_IV_V,
    ],
    'Jazzy & Soulful': [
        ChordProgression.II_V_I,
        ChordProgression.I_VI_II_V,
        ChordProgression.III_VI_II_V,
        ChordProgression.I_II_V,
    ],
    'Cinematic & Emotive': [
        ChordProgression.I_V_IV_IV,
        ChordProgression.VI_VII_I_I,
        ChordProgression.I_VII_VI_V,
        ChordProgression.IV_I_V_VI,
    ],
};

export const MELODY_INSTRUMENTS: MelodyInstrument[] = [
    MelodyInstrument.LEAD_SYNTH,
    MelodyInstrument.PIANO,
    MelodyInstrument.GUITAR,
    MelodyInstrument.FLUTE
];

export const SCALES: Scale[] = [
    Scale.MAJOR,
    Scale.MINOR_NATURAL,
    Scale.MINOR_HARMONIC,
    Scale.DORIAN,
    Scale.PHRYGIAN,
    Scale.LYDIAN,
    Scale.MIXOLYDIAN,
    Scale.BLUES
];

export const MELODY_STYLES: MelodyStyle[] = [
    MelodyStyle.FLOWING,
    MelodyStyle.CHOPPY,
    MelodyStyle.JAZZY,
    MelodyStyle.EXPERIMENTAL
];

export const BASS_STYLES: BassStyle[] = [
    BassStyle.SIMPLE_ROOTS,
    BassStyle.WALKING_BASS,
    BassStyle.FUNKY_SYNCOPATED
];

export const ARPEGGIO_STYLES: ArpeggioStyle[] = [
    ArpeggioStyle.UP,
    ArpeggioStyle.DOWN,
    ArpeggioStyle.UP_DOWN,
    ArpeggioStyle.RANDOM
];

export const NOTE_DENSITIES: NoteDensity[] = [
    NoteDensity.LOW,
    NoteDensity.MEDIUM,
    NoteDensity.HIGH
];