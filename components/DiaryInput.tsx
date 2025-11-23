import React from 'react';

interface DiaryInputProps {
  title: string;
  setTitle: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const DiaryInput: React.FC<DiaryInputProps> = ({ 
  title, 
  setTitle, 
  date, 
  setDate, 
  value, 
  onChange, 
  onSubmit, 
  isLoading 
}) => {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
            <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#396A84] dark:focus:border-[#5DA8C9] outline-none text-slate-600 dark:text-slate-400 font-mono text-sm transition-colors"
            />
        </div>
        <div className="md:w-2/3">
            <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full p-2 bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-[#396A84] dark:focus:border-[#5DA8C9] outline-none text-slate-800 dark:text-slate-200 font-medium placeholder-slate-300 dark:placeholder-slate-600 transition-colors"
            />
        </div>
      </div>
      
      <div className="flex-grow relative">
        <textarea
            className="w-full h-full p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#396A84] dark:focus:border-[#5DA8C9] focus:ring-1 focus:ring-[#396A84] dark:focus:ring-[#5DA8C9] transition-all resize-none outline-none font-sans text-lg leading-relaxed text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 custom-scrollbar"
            placeholder="Write your story..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-xs text-slate-300 dark:text-slate-600">
          {value.length}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onSubmit}
          disabled={isLoading || value.trim().length === 0}
          className={`
            px-8 py-3 rounded text-sm font-semibold tracking-wide transition-all
            ${isLoading || value.trim().length === 0
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'bg-[#396A84] hover:bg-[#2c5267] dark:bg-[#5DA8C9] dark:hover:bg-[#4a8ea6] text-white'}
          `}
        >
          {isLoading ? 'Correcting...' : 'Correct with AI'}
        </button>
      </div>
    </div>
  );
};

export default DiaryInput;