import { Midi } from '@tonejs/midi';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Time, Transport } from 'tone';
import { NoteEvent, ChordEvent } from '../types';

export const createMidiFile = (notes: (NoteEvent | ChordEvent)[], trackName: string): Uint8Array | null => {
    try {
        const midi = new Midi();

        // --- PPQ Synchronization Fix ---
        // The `ppq` (Pulses Per Quarter) in the midi header is read-only in the current version of `@tonejs/midi`.
        // To ensure the timing is correct when exporting, we must scale the tick values from Tone.js's Transport
        // (which uses its own PPQ, `Transport.PPQ`) to match the MIDI file's PPQ (`midi.header.ppq`).
        const ppqRatio = midi.header.ppq / Transport.PPQ;

        const track = midi.addTrack();
        track.name = trackName;

        notes.forEach(note => {
            const startTicks = Time(note.time).toTicks() * ppqRatio;
            const durationTicks = Time(note.duration).toTicks() * ppqRatio;

            if ('note' in note) { // NoteEvent
                track.addNote({
                    name: note.note,
                    ticks: startTicks,
                    durationTicks: durationTicks,
                    velocity: note.velocity,
                });
            } else { // ChordEvent
                note.notes.forEach(chordNoteName => {
                    track.addNote({
                        name: chordNoteName,
                        ticks: startTicks,
                        durationTicks: durationTicks,
                        velocity: note.velocity,
                    });
                });
            }
        });

        return midi.toArray();
    } catch (e) {
        console.error("Failed to create MIDI file:", e);
        return null;
    }
};

export const createZipAndDownload = async (files: { name: string, data: Uint8Array }[], zipFileName: string) => {
    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.name, file.data);
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, zipFileName);
    } catch (e) {
        console.error("Failed to create ZIP file:", e);
    }
};