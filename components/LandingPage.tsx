import React from 'react';
import MidianLogo from './MidianLogo';
import { DocumentIcon, SettingsIcon, SparklesIcon, DownloadIcon } from './icons';

interface LandingPageProps {
    onLaunch: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-panel-bg/50 p-6 rounded-lg">
        <div className="flex items-center gap-4 mb-3">
            {icon}
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-text-muted leading-relaxed">{children}</p>
    </div>
);

const HowToStep: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 border-2 border-primary/30 rounded-full text-primary font-bold text-xl">
            {number}
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-text-muted leading-relaxed">{children}</p>
        </div>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
    return (
        <div className="min-h-screen bg-background text-text-light font-sans">
            {/* Header */}
            <header className="py-4 px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <MidianLogo className="h-10 w-auto" />
                    </div>
                     <a href="https://github.com/google/genai-patterns" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M9 19c-4.3 1.4 -4.3-2.5 -6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6.1 0-1.3-.5-2.4-1.3-3.2.1-.3.5-1.5-.1-3.2 0 0-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C3.3 5.4 2.2 5.7 2.2 5.7c-.6 1.7-.2 2.9-.1 3.2-.8.8-1.3 1.9-1.3 3.2 0 4.6 2.7 5.7 5.5 6-.6.5-1 1.4-1 2.8v4"/></svg>
                    </a>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="text-center py-20 sm:py-28">
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight">
                        Where Music Meets <span className="text-primary">AI</span>.
                    </h1>
                    <p className="max-w-2xl mx-auto mt-6 text-lg sm:text-xl text-text-muted leading-8">
                        Craft professional-grade MIDI for any genre with MIDIAN, your AI-powered music production partner. Generate inspired drum loops, emotional chord progressions, and expressive melodies in seconds.
                    </p>
                    <div className="mt-10">
                        <button onClick={onLaunch} className="bg-primary text-white font-bold text-lg py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 hover:bg-primary-hover transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/50">
                           Launch the Studio
                        </button>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white">From Idea to MIDI in Seconds</h2>
                        <p className="mt-4 text-lg text-text-muted">A simple, powerful workflow designed for creativity.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <HowToStep number="1" title="Set Your Canvas">
                            Select your desired genre, key, tempo, and song structure. Dial in the core feel of your track before the first note is even played.
                        </HowToStep>
                        <HowToStep number="2" title="Generate with Intent">
                            Use the 'Generate Full Song' button for a cohesive arrangement, or craft your track layer-by-layer. Our virtuoso AI understands your needs.
                        </HowToStep>
                        <HowToStep number="3" title="Export & Integrate">
                            Preview your creation, select the tracks you love, and download a single ZIP file containing perfect, loopable MIDI ready for any DAW.
                        </HowToStep>
                    </div>
                </section>
                
                {/* Features Section */}
                <section className="py-20">
                     <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white">A Studio Assistant That Understands Music</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard icon={<SparklesIcon className="w-8 h-8 text-primary"/>} title="Virtuoso AI Engine">
                            Our AI doesn't just generate random notes. It understands music theory, genre conventions, and the nuances that make a performance feel human.
                        </FeatureCard>
                        <FeatureCard icon={<SettingsIcon className="w-8 h-8 text-primary"/>} title="Granular Creative Control">
                            You're the producer. Dictate the complexity of drums, the style of a melody, the density of arpeggios, and more. The AI adapts to your vision.
                        </FeatureCard>
                         <FeatureCard icon={<SparklesIcon className="w-8 h-8 text-primary"/>} title="Complete Song Generation">
                            Go beyond single loops. Create entire song structures (up to 64 bars) with harmonically-aware basslines and melodies that follow your chord progression.
                        </FeatureCard>
                        <FeatureCard icon={<DocumentIcon className="w-8 h-8 text-primary"/>} title="DAW-Ready Output">
                            Every MIDI file is guaranteed to be perfectly looped and sanitized, saving you hours of tedious editing. It just works.
                        </FeatureCard>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="text-center py-20">
                     <h2 className="text-4xl font-bold text-white tracking-tight">
                        Stop Searching for Loops.
                        <br/>
                        Start Creating Them.
                    </h2>
                     <div className="mt-10">
                        <button onClick={onLaunch} className="bg-primary text-white font-bold text-lg py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 hover:bg-primary-hover transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/50">
                           Start Generating Now
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;