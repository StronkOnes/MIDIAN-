import React from 'react';
import MidianLogo from './MidianLogo';

const LoadingTransition: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 transition-opacity duration-500">
            <div className="relative flex items-center justify-center">
                {/* Pulsating rings */}
                <div className="absolute w-32 h-32 rounded-full border-2 border-primary/50 animate-ping-slow"></div>
                <div className="absolute w-48 h-48 rounded-full border-2 border-primary/30 animate-ping-slower"></div>
                
                <MidianLogo className="h-20 w-auto z-10" />
            </div>
            <p className="text-white text-xl mt-8 tracking-widest font-light animate-pulse">
                LOADING STUDIO...
            </p>
            <style>
                {`
                @keyframes ping-slow {
                    75%, 100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                @keyframes ping-slower {
                    75%, 100% {
                        transform: scale(1.3);
                        opacity: 0;
                    }
                }
                .animate-ping-slow {
                    animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                 .animate-ping-slower {
                    animation: ping-slower 2.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s;
                }
                `}
            </style>
        </div>
    );
};

export default LoadingTransition;