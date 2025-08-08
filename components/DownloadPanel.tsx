import React from 'react';
import { DrumData, ChordData, MelodyData, BassData, LayersData, TrackId } from '../types';
import { DownloadIcon, PlayIcon, StopIcon, ListMusicIcon } from './icons';

interface DownloadPanelProps {
    drumData: DrumData | null;
    chordData: ChordData | null;
    melodyData: MelodyData | null;
    bassData: BassData | null;
    layersData: LayersData | null;
    selectedTracks: Set<TrackId>;
    setSelectedTracks: React.Dispatch<React.SetStateAction<Set<TrackId>>>;
    isPlaying: boolean;
    onPlayToggle: () => void;
    onDownload: () => void;
    isActionable: boolean;
}

const TrackCheckbox: React.FC<{id: TrackId, label: string, checked: boolean, onChange: (id: TrackId) => void, disabled: boolean}> = 
({ id, label, checked, onChange, disabled }) => (
    <label htmlFor={id} className={`flex items-center space-x-3 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
        <input 
            type="checkbox"
            id={id}
            checked={checked}
            onChange={() => onChange(id)}
            disabled={disabled}
            className="h-4 w-4 rounded bg-control-bg border-control-border text-primary focus:ring-primary disabled:cursor-not-allowed"
        />
        <span className="text-text-light">{label}</span>
    </label>
)

const DownloadPanel: React.FC<DownloadPanelProps> = ({
    drumData, chordData, melodyData, bassData, layersData, selectedTracks, setSelectedTracks,
    isPlaying, onPlayToggle, onDownload, isActionable
}) => {

    const handleTrackSelection = (id: TrackId) => {
        setSelectedTracks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const isDownloadDisabled = selectedTracks.size === 0 || !isActionable;

    return (
        <div className="bg-panel-bg p-5 rounded-lg shadow-lg h-full">
            <div className="flex items-center mb-6">
                <ListMusicIcon className="w-6 h-6 mr-3 text-primary" />
                <h2 className="text-xl font-bold text-white">Preview & Download</h2>
            </div>

            <div className="space-y-4 mb-6">
                <h3 className="text-md font-semibold text-text-muted border-b border-control-border pb-2">Generated Tracks</h3>
                 <div className="space-y-3 pt-2">
                    {drumData && (
                        <>
                            <TrackCheckbox id="kick" label="Kick" checked={selectedTracks.has('kick')} onChange={handleTrackSelection} disabled={!drumData.kick || drumData.kick.length === 0} />
                            <TrackCheckbox id="snare" label="Snare" checked={selectedTracks.has('snare')} onChange={handleTrackSelection} disabled={!drumData.snare || drumData.snare.length === 0} />
                            <TrackCheckbox id="hihat" label="Hi-Hat" checked={selectedTracks.has('hihat')} onChange={handleTrackSelection} disabled={!drumData.hihat || drumData.hihat.length === 0} />
                            <TrackCheckbox id="full_drums" label="Drums (Full Loop)" checked={selectedTracks.has('full_drums')} onChange={handleTrackSelection} disabled={!drumData} />
                        </>
                    )}
                    {chordData && <TrackCheckbox id="chords" label="Chords" checked={selectedTracks.has('chords')} onChange={handleTrackSelection} disabled={!chordData || chordData.length === 0} />}
                    {melodyData && <TrackCheckbox id="melody" label="Melody" checked={selectedTracks.has('melody')} onChange={handleTrackSelection} disabled={!melodyData || melodyData.length === 0} />}
                    {bassData && <TrackCheckbox id="bass" label="Bassline" checked={selectedTracks.has('bass')} onChange={handleTrackSelection} disabled={!bassData || bassData.length === 0} />}
                    {layersData && <TrackCheckbox id="layers" label="Layers" checked={selectedTracks.has('layers')} onChange={handleTrackSelection} disabled={!layersData || layersData.length === 0} />}

                    {!isActionable && <p className="text-sm text-text-muted">Generate some music to see tracks here.</p>}
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={onPlayToggle}
                    disabled={!isActionable}
                    className="w-full flex items-center justify-center gap-2 bg-control-bg hover:bg-control-border disabled:bg-control-bg/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    {isPlaying ? <><StopIcon className="w-5 h-5"/> Stop</> : <><PlayIcon className="w-5 h-5"/> Play</>}
                </button>
                <button
                    onClick={onDownload}
                    disabled={isDownloadDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/30 disabled:text-text-muted disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <DownloadIcon className="w-5 h-5"/>
                    Download Selected
                </button>
            </div>
        </div>
    );
};

export default DownloadPanel;