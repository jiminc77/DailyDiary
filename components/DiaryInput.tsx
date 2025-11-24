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
    <div className="flex flex-col h-full">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>
      <div className="flex flex-col md:flex-row border-b border-[#E9E9E7] dark:border-[#2F2F2F]">
        <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-[#E9E9E7] dark:border-[#2F2F2F]">
            <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 bg-transparent outline-none text-[#37352F] dark:text-[#D4D4D4] font-sans text-sm tracking-wide"
            />
        </div>
        <div className="md:w-2/3">
            <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="w-full p-4 bg-transparent outline-none text-[#37352F] dark:text-[#D4D4D4] font-semibold placeholder-[#9B9B9B] dark:placeholder-[#5A5A5A]"
            />
        </div>
      </div>
      
      <div className="relative min-h-[400px]">
        <textarea
            className="w-full h-full p-6 bg-transparent outline-none resize-none font-sans text-lg leading-relaxed text-[#37352F] dark:text-[#D4D4D4] placeholder-[#9B9B9B] dark:placeholder-[#5A5A5A] custom-scrollbar absolute inset-0"
            placeholder="Write your story..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 text-xs text-[#9B9B9B] dark:text-[#5A5A5A] pointer-events-none">
          {value.length} characters
        </div>
      </div>

      <div className="p-4 border-t border-[#E9E9E7] dark:border-[#2F2F2F] flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isLoading || value.trim().length === 0}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
            ${isLoading || value.trim().length === 0
              ? 'bg-gray-100 dark:bg-[#2F2F2F] text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'}
          `}
        >
          {isLoading ? (
             <>
               <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span>Processing...</span>
             </>
          ) : (
             <>
               <span>Correct with AI</span>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DiaryInput;