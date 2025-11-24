import React, { useState, useEffect, useMemo } from 'react';
import DiaryInput from './components/DiaryInput';
import DiaryDisplay from './components/DiaryDisplay';
import AnalysisResult from './components/AnalysisResult';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import { analyzeDiaryEntry } from './services/geminiService';
import { diaryService } from './services/diaryService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { parseAnalysisResult } from './utils/parser';

const DiaryApp: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  
  // Initialize date from URL or today
  const getInitialDate = () => {
    const params = new URLSearchParams(window.location.search);
    const urlDate = params.get('date');
    if (urlDate && !isNaN(Date.parse(urlDate))) {
      return urlDate;
    }
    return new Date().toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getInitialDate);
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync URL with date
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('date') !== date) {
      const newUrl = window.location.pathname + '?date=' + date;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  }, [date]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setDate(getInitialDate());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load diary when date changes
  useEffect(() => {
    if (!user) return;

    const loadDiary = async () => {
      try {
        const entry = await diaryService.getDiaryByDate(date);
        if (entry) {
          setTitle(entry.title || '');
          setInputText(entry.original_content || '');
          setResult(entry.analysis_result || null);
        } else {
          // Reset if no entry found for this date
          setTitle('');
          setInputText('');
          setResult(null);
        }
      } catch (err) {
        console.error('Failed to load diary:', err);
      }
    };

    loadDiary();
  }, [date, user]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Analyze with Gemini
      const response = await analyzeDiaryEntry(inputText);
      setResult(response);

      // 2. Save to Supabase
      setIsSaving(true);
      await diaryService.saveDiary(date, title, inputText, response);
      
      // Force refresh sidebar by toggling a dummy state or just relying on date change if needed
      // In a real app we might use a query cache or context to refresh the list
    } catch (err) {
      setError("Failed to analyze or save diary. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await diaryService.deleteDiary(id);
      // If deleted diary is current one, clear screen
      // We need to check if the deleted ID matches current loaded diary.
      // Since we don't store current ID in state, we can check by date if needed, 
      // but simpler is to just reload if the date matches.
      // Actually, Sidebar handles the refresh of the list.
      // If we are viewing the deleted diary, we should probably clear the view.
      // Let's just clear the view if we are on the same date.
      // But we don't know the date of the deleted ID here easily without fetching.
      // For now, let's just assume if the user deletes from sidebar, they might still be viewing it.
      // Ideally we should redirect to today or clear.
      // Let's reload the current date's diary to see if it's gone.
      const entry = await diaryService.getDiaryByDate(date);
      if (!entry) {
          setTitle('');
          setInputText('');
          setResult(null);
      }
    } catch (err) {
      console.error('Failed to delete diary:', err);
      setError("Failed to delete diary.");
    }
  };

  // Parse result for highlighting
  const parsedFeedback = useMemo(() => {
    if (!result) return [];
    const parsed = parseAnalysisResult(result);
    return parsed.feedback || [];
  }, [result]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] dark:bg-[#191919]">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#191919] text-[#37352F] dark:text-[#D4D4D4] font-sans transition-colors duration-300 flex">
      
      <Sidebar 
        currentDate={date} 
        onSelectDate={setDate} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onDelete={handleDelete}
      />

      <div className="flex-1 min-w-0 transition-all duration-300">
        <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
          
          {/* Top Navigation Bar */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
              {/* Mobile Toggle */}
              <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden text-[#787774] p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
              </button>
              
              {/* Desktop Toggle */}
              <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hidden md:block text-[#787774] hover:text-[#37352F] dark:hover:text-[#D4D4D4] transition-colors p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
              </button>
          </div>

          <div className="absolute top-6 right-6 z-10">
              <button 
                  onClick={signOut}
                  className="text-xs text-[#9B9B9B] hover:text-[#37352F] dark:hover:text-[#D4D4D4] transition-colors font-medium"
              >
                  Sign Out
              </button>
          </div>
          
          {/* Header Section */}
          <div className="mb-12 text-center mt-12">
              <h1 
                  onClick={() => {
                      setDate(new Date().toISOString().split('T')[0]);
                      setTitle('');
                      setInputText('');
                      setResult(null);
                      // Update URL
                      const today = new Date().toISOString().split('T')[0];
                      const newUrl = window.location.pathname + '?date=' + today;
                      window.history.pushState({ path: newUrl }, '', newUrl);
                  }}
                  className="text-4xl font-extrabold tracking-tight mb-2 text-[#37352F] dark:text-[#E3E3E3] cursor-pointer hover:opacity-80 transition-opacity inline-block"
              >
                  Daily Diary
              </h1>
              <p className="text-[#787774] dark:text-[#9B9B9B]">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
          </div>

          <div className="space-y-12">
            
            {/* Input or Read-Only Display Section */}
            {result ? (
                 <div className="animate-fade-in">
                    <DiaryDisplay content={inputText} feedback={parsedFeedback} />
                 </div>
            ) : (
                <div className="bg-white dark:bg-[#202020] rounded-xl shadow-sm border border-[#E9E9E7] dark:border-[#2F2F2F] p-1 transition-all duration-500 ease-in-out">
                    <DiaryInput 
                        title={title}
                        setTitle={setTitle}
                        date={date}
                        setDate={setDate}
                        value={inputText}
                        onChange={setInputText}
                        onSubmit={handleAnalyze}
                        isLoading={isLoading}
                    />
                </div>
            )}

            {/* Output Section */}
            <div className="flex flex-col">
              {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded text-sm mb-6">
                      {error}
                  </div>
              )}

              {isLoading && (
                 <div className="space-y-8 animate-pulse py-4 max-w-2xl mx-auto w-full">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                    </div>
                 </div>
              )}

              {result && (
                  <div className="mt-8 animate-fade-in">
                      <AnalysisResult rawMarkdown={result} />
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DiaryApp />
    </AuthProvider>
  );
};

export default App;