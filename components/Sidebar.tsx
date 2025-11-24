import React, { useEffect, useState } from 'react';
import { diaryService } from '../services/diaryService';

interface SidebarProps {
  currentDate: string;
  onSelectDate: (date: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

interface DiarySummary {
  id: string;
  date: string;
  title: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentDate, onSelectDate, isOpen, onClose, onDelete }) => {
  const [diaries, setDiaries] = useState<DiarySummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Expose refresh method or just rely on parent to force re-render?
  // For simplicity, we'll fetch when isOpen changes to true as well, or just rely on currentDate change
  // But deleting needs to refresh the list locally.
  
  const fetchDiaries = async () => {
      try {
        const data = await diaryService.getDiaryList();
        setDiaries(data || []);
      } catch (error) {
        console.error('Failed to fetch diary list:', error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchDiaries();
  }, [currentDate, isOpen]); 

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm('Are you sure you want to delete this diary?')) {
          await onDelete(id);
          fetchDiaries(); // Refresh list after delete
      }
  };

  // Group by Month
  const groupedDiaries = diaries.reduce((acc, diary) => {
    const date = new Date(diary.date);
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(diary);
    return acc;
  }, {} as Record<string, DiarySummary[]>);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative top-0 left-0 h-screen bg-[#F7F7F5] dark:bg-[#191919] border-r border-[#E9E9E7] dark:border-[#2F2F2F] z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-64 md:w-0 md:border-none md:overflow-hidden'}
        `}
      >
        <div className="w-64 h-full overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold text-[#787774] dark:text-[#9B9B9B] uppercase tracking-wider">
              History
            </h2>
            <button 
              onClick={onClose} 
              className="text-[#787774] hover:text-[#37352F] dark:hover:text-[#D4D4D4] transition-colors p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
              title="Close Sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
               ))}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedDiaries).map(([month, items]: [string, DiarySummary[]]) => (
                <div key={month}>
                  <h3 className="text-xs font-semibold text-[#37352F] dark:text-[#D4D4D4] mb-3 sticky top-0 bg-[#F7F7F5] dark:bg-[#191919] py-1">
                    {month}
                  </h3>
                  <ul className="space-y-1">
                    {items.map((diary) => (
                      <li key={diary.id} className="group relative">
                        <button
                          onClick={() => {
                            onSelectDate(diary.date);
                            if (window.innerWidth < 768) onClose();
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-md text-sm transition-colors truncate pr-8
                            ${currentDate === diary.date 
                              ? 'bg-[#E9E9E7] dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] font-medium' 
                              : 'text-[#787774] dark:text-[#9B9B9B] hover:bg-[#F0F0EF] dark:hover:bg-[#252525]'}
                          `}
                        >
                          <span className="mr-2 opacity-70">
                            {new Date(diary.date).getDate()}
                          </span>
                          {diary.title || 'Untitled'}
                        </button>
                        <button
                            onClick={(e) => handleDeleteClick(e, diary.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                            title="Delete"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {diaries.length === 0 && (
                <p className="text-sm text-[#787774] dark:text-[#9B9B9B] italic">
                  No diaries yet.
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
