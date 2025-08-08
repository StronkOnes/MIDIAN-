import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoadingTransition from './components/LoadingTransition';
import Tool from './Tool';

type View = 'landing' | 'loading' | 'tool';

const App: React.FC = () => {
    const [view, setView] = useState<View>('landing');

    const handleLaunch = () => {
        setView('loading');
        // Simulate loading assets for a better user experience
        setTimeout(() => {
            setView('tool');
        }, 2500);
    };

    switch (view) {
        case 'loading':
            return <LoadingTransition />;
        case 'tool':
            return <Tool />;
        case 'landing':
        default:
            return <LandingPage onLaunch={handleLaunch} />;
    }
};

export default App;
