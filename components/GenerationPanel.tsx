import React from 'react';
import { MusicIcon, SparklesIcon, MelodyIcon, BassIcon, LayersIcon } from './icons';

interface GenerationPanelProps {
    onGenerateDrums: () => void;
    onGenerateChords: () => void;
    onGenerateMelody: () => void;
    onGenerateBass: () => void;
    onGenerateLayers: () => void;
    onGenerateAll: () => void;
    isLoading: Record<string, boolean>;
}

const GenerationButton: React.FC<{ onClick: () => void; isLoading: boolean; disabled: boolean; children: React.ReactNode; title?: string; primary?: boolean }> = 
({ onClick, isLoading, disabled, children, title, primary = false }) => (
    <button
        onClick={onClick}
        disabled={disabled || isLoading}
        title={title}
        className={`relative w-full flex items-center justify-center gap-3 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel-bg focus:ring-primary
        ${primary ? 'bg-primary hover:bg-primary-hover' : 'bg-control-bg hover:bg-control-border'}
        ${(disabled || isLoading) ? 'transform-none' : ''}`}
    >
        {children}
        {(disabled || isLoading) && (
             <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center cursor-not-allowed">
                {isLoading && (
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </div>
                )}
            </div>
        )}
    </button>
);


const GenerationPanel: React.FC<GenerationPanelProps> = ({ 
    onGenerateDrums, onGenerateChords, onGenerateMelody, onGenerateBass, onGenerateLayers, onGenerateAll,
    isLoading
}) => {
    const anyLoading = Object.values(isLoading).some(v => v);

    return (
        <div className="bg-panel-bg p-5 rounded-lg shadow-lg h-full flex flex-col justify-center items-center">
             <div className="flex items-center mb-6 text-center flex-col">
                <SparklesIcon className="w-10 h-10 mb-3 text-primary" />
                <h2 className="text-xl font-bold text-white">Generate Music</h2>
                <p className="text-text-muted mt-1">Generate a full song or individual layers.</p>
            </div>
            <div className="w-full max-w-sm space-y-3">
                <GenerationButton 
                    onClick={onGenerateAll} 
                    isLoading={isLoading.all} 
                    disabled={anyLoading && !isLoading.all}
                    primary={true}
                >
                    <SparklesIcon className="w-5 h-5"/>Generate Full Song
                </GenerationButton>

                <hr className="border-control-border my-4"/>

                <GenerationButton onClick={onGenerateDrums} isLoading={isLoading.drums} disabled={anyLoading && !isLoading.drums}><MusicIcon className="w-5 h-5"/>Generate Drums</GenerationButton>
                <GenerationButton onClick={onGenerateChords} isLoading={isLoading.chords} disabled={anyLoading && !isLoading.chords}><MusicIcon className="w-5 h-5"/>Generate Chords</GenerationButton>
                <GenerationButton 
                    onClick={onGenerateMelody} 
                    isLoading={isLoading.melody} 
                    disabled={anyLoading && !isLoading.melody}
                    title="Generates a melody. If no chords exist, they will be generated first."
                >
                    <MelodyIcon className="w-5 h-5"/>Generate Melody
                </GenerationButton>
                <GenerationButton 
                    onClick={onGenerateBass} 
                    isLoading={isLoading.bass} 
                    disabled={(anyLoading && !isLoading.bass)}
                    title="Generates a bassline. If no chords exist, they will be generated first."
                >
                    <BassIcon className="w-5 h-5"/>Generate Bassline
                </GenerationButton>
                <GenerationButton 
                    onClick={onGenerateLayers} 
                    isLoading={isLoading.layers} 
                    disabled={(anyLoading && !isLoading.layers)}
                    title="Generates layers. If no chords exist, they will be generated first."
                >
                    <LayersIcon className="w-5 h-5"/>Generate Layers
                </GenerationButton>
            </div>
        </div>
    );
};

export default GenerationPanel;