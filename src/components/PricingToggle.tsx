import React from 'react';

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
}

export const PricingToggle: React.FC<PricingToggleProps> = ({ isYearly, onToggle }) => {
  return (
    <div className="flex items-center justify-center mt-6 mb-10 space-x-4">
      <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
      <button
        type="button"
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 bg-indigo-600"
        role="switch"
        aria-checked={isYearly}
        onClick={onToggle}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isYearly ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}>
        Yearly <span className="text-indigo-400">(Save 20%)</span>
      </span>
    </div>
  );
};
