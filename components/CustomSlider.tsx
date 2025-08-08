import React from 'react';

interface CustomSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CustomSlider: React.FC<CustomSliderProps> = (props) => {
    return (
        <input
            type="range"
            {...props}
            className="w-full h-2 bg-control-bg rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel-bg focus:ring-primary/50"
            style={{
                // Custom thumb styles are applied globally in index.html for better cross-browser compatibility
            }}
        />
    );
};

export default CustomSlider;