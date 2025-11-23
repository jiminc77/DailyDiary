import React, { useState, useEffect } from 'react';
import DiaryInput from './components/DiaryInput';
import AnalysisResult from './components/AnalysisResult';
import { analyzeDiaryEntry } from './services/geminiService';

const App: React.FC = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeDiaryEntry(inputText);
      setResult(response);
    } catch (err) {
      setError("Failed to analyze diary. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">API Key Missing</h1>
          <p className="text-slate-600 dark:text-slate-400">Please check your configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-2xl">✍️</span>
                <h1 className="text-lg font-bold text-[#396A84] dark:text-[#5DA8C9] tracking-tight">
                    Daily Diary
                </h1>
            </div>
            <div className="text-sm text-slate-400 dark:text-slate-500">
               {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[calc(100vh-10rem)]">
          
          {/* Left Column: Input */}
          <div className="flex flex-col h-[600px] lg:h-auto lg:sticky lg:top-24 self-start">
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

          {/* Right Column: Output */}
          <div className="flex flex-col">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded text-sm mb-6">
                    {error}
                </div>
            )}

            {!result && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    <p className="text-sm font-medium">Analysis results will appear here</p>
                </div>
            )}

            {isLoading && (
               <div className="space-y-8 animate-pulse py-4">
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-8"></div>
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                  </div>
               </div>
            )}

            {result && (
                <AnalysisResult rawMarkdown={result} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;