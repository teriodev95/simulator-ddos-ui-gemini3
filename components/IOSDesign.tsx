import React from 'react';
import { motion } from 'framer-motion';

// --- Card ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const IOSCard: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white/70 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 p-5 ${className}`}>
      {title && <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider ml-1">{title}</h3>}
      {children}
    </div>
  );
};

// --- Toggle ---
interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  label: string;
  icon?: React.ReactNode;
}

export const IOSToggle: React.FC<ToggleProps> = ({ isOn, onToggle, label, icon }) => {
  return (
    <div className="flex items-center justify-between py-3 cursor-pointer group" onClick={onToggle}>
      <div className="flex items-center gap-3">
        {icon && <div className={`p-1.5 rounded-lg transition-colors ${isOn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>{icon}</div>}
        <span className="text-[17px] font-medium text-slate-800 group-active:scale-[0.99] transition-transform origin-left">{label}</span>
      </div>
      
      <div 
        className={`w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-300 ease-in-out ${isOn ? 'bg-[#34C759]' : 'bg-[#E9E9EA]'}`}
      >
        <motion.div
          className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)] border-[0.5px] border-black/5"
          animate={{ x: isOn ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  );
};

// --- Slider ---
interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  label: string;
}

export const IOSSlider: React.FC<SliderProps> = ({ value, min, max, onChange, label }) => {
  return (
    <div className="py-2">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value} / {max}</span>
      </div>
      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
        />
        <div className="w-full h-[6px] bg-slate-200 rounded-full overflow-hidden absolute z-10">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((value - min) / (max - min)) * 100}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          />
        </div>
        <motion.div 
          className="w-6 h-6 bg-white rounded-full shadow-md border border-slate-100 absolute z-10 pointer-events-none"
          animate={{ left: `calc(${((value - min) / (max - min)) * 100}% - 12px)` }}
          transition={{ type: "spring", bounce: 0, duration: 0.1 }}
        />
      </div>
    </div>
  );
};

// --- Segmented Control ---
interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  selected: string;
  onChange: (val: string) => void;
}

export const IOSSegmentedControl: React.FC<SegmentedControlProps> = ({ options, selected, onChange }) => {
  return (
    <div className="bg-[#E9E9EA] p-[2px] rounded-[9px] flex relative h-[32px] w-full">
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 relative z-10 text-[13px] font-medium transition-colors duration-200 ${isSelected ? 'text-black' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {option.label}
            {isSelected && (
              <motion.div
                layoutId="segmentIndicator"
                className="absolute inset-0 bg-white rounded-[7px] shadow-[0_1px_3px_rgba(0,0,0,0.12)] -z-10 my-[2px] mx-[2px]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
