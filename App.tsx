import React, { useState, useEffect } from 'react';
import DiaryInput from './components/DiaryInput';
import AnalysisResult from './components/AnalysisResult';
import Login from './components/Login';
import { analyzeDiaryEntry } from './services/geminiService';
import { diaryService } from './services/diaryService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const DiaryApp: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    } catch (err) {
      setError("Failed to analyze or save diary. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] dark:bg-[#191919]">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#191919] text-[#37352F] dark:text-[#D4D4D4] font-sans transition-colors duration-300">
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header Section */}
        <div className="mb-12 text-center relative">
            <button 
                onClick={signOut}
                className="absolute right-0 top-0 text-xs text-[#9B9B9B] hover:text-[#37352F] dark:hover:text-[#D4D4D4] transition-colors"
            >
                Sign Out
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[#37352F] dark:text-[#E3E3E3]">Daily Diary</h1>
            <p className="text-[#787774] dark:text-[#9B9B9B]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
        </div>

        <div className="space-y-12">
          
          {/* Input Section */}
          <div className="bg-white dark:bg-[#202020] rounded-xl shadow-sm border border-[#E9E9E7] dark:border-[#2F2F2F] p-1">
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
                <div className="mt-8 border-t border-[#E9E9E7] dark:border-[#2F2F2F] pt-12">
                    <AnalysisResult rawMarkdown={result} />
                </div>
            )}
          </div>
        </div>
      </main>
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