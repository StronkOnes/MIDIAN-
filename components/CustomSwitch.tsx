import React from 'react';

interface CustomSwitchProps {
    label: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    disabled?: boolean;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ label, enabled, setEnabled, disabled = false }) => {
    return (
        <label className={`flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="text-sm font-medium text-text-muted">{label}</span>
            <button
                type="button"
                onClick={() => !disabled && setEnabled(!enabled)}
                className={`${
                    enabled ? 'bg-primary' : 'bg-control-bg'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-panel-bg disabled:cursor-not-allowed`}
                disabled={disabled}
            >
                <span
                    aria-hidden="true"
                    className={`${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </label>
    );
};

export default CustomSwitch;