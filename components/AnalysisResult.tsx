import React, { useMemo, useState } from 'react';
import { ParsedAnalysis } from '../types';
import { parseAnalysisResult } from '../utils/parser';

interface AnalysisResultProps {
  rawMarkdown: string;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ rawMarkdown }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Robust parsing logic
  const parsedData: ParsedAnalysis = useMemo(() => {
    return parseAnalysisResult(rawMarkdown);
  }, [rawMarkdown]);

  const handleCopyForNotion = () => {
    if (!parsedData.nativeVersion) return;

    // Split by paragraphs (double newlines or just newlines if they look like paragraphs)
    // We treat any non-empty line group as a paragraph
    const paragraphs = parsedData.nativeVersion
        .split(/\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    // Format: bullet point per paragraph
    let formattedBody = paragraphs.map(p => `- ${p}`).join('\n');
    
    // Add link to current diary
    const currentUrl = window.location.href;
    formattedBody += `\n- [Link to Diary](${currentUrl})`;
    
    // Only copy the body, no link
    navigator.clipboard.writeText(formattedBody).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  // Helper to render text with bold parts
  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-[#396A84] dark:text-[#5DA8C9]">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!rawMarkdown) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-12 animate-fade-in">
      
      {/* 1. Native Version Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-baseline border-b border-slate-200 dark:border-slate-700 pb-2 mb-6">
            <h3 className="text-xl font-bold text-[#396A84] dark:text-[#5DA8C9]">
                Native Version
            </h3>
            <button 
                onClick={handleCopyForNotion}
                className="text-sm font-medium text-slate-400 hover:text-[#396A84] dark:hover:text-[#5DA8C9] transition-colors flex items-center gap-1.5"
            >
                {copyStatus === 'copied' ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                         Copied
                    </span>
                ) : (
                    <>
                        <span>Copy for Notion</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    </>
                )}
            </button>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-lg leading-relaxed whitespace-pre-line font-sans">
            {renderBoldText(parsedData.nativeVersion)}
        </div>
      </section>

      {/* 2. Feedback Section */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-6">
            <h3 className="text-xl font-bold text-[#396A84] dark:text-[#5DA8C9]">
                Grammar & Feedback
            </h3>
        </div>
        <ul className="space-y-6 list-none pl-0">
            {parsedData.feedback.map((line, idx) => {
                // Check if line has structure like "**Wrong** -> **Right**"
                const parts = line.split(/→|->/);
                if (parts.length > 1) {
                    const originalRaw = parts[0].trim();
                    const rest = parts[1].trim();
                    
                    const correctionEndIdx = rest.indexOf('(');
                    const correctionRaw = correctionEndIdx !== -1 ? rest.substring(0, correctionEndIdx).trim() : rest;
                    const explanationRaw = correctionEndIdx !== -1 ? rest.substring(correctionEndIdx).replace(/[()]/g, '').trim() : '';

                    const original = originalRaw.replace(/\*\*/g, '');
                    const correction = correctionRaw.replace(/\*\*/g, '');

                    return (
                        <li key={idx} className="block">
                            <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                <span className="text-slate-400 line-through decoration-slate-400">{original}</span>
                                <span className="text-slate-400 text-sm">→</span>
                                <span className="font-semibold text-[#396A84] dark:text-[#5DA8C9]">{correction}</span>
                            </div>
                            {explanationRaw && (
                                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{explanationRaw}</p>
                            )}
                        </li>
                    )
                }
                
                // Fallback for simple bullets
                return (
                    <li key={idx} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        <span className="mr-2 text-[#396A84] dark:text-[#5DA8C9]">•</span>
                        {renderBoldText(line)}
                    </li>
                );
            })}
        </ul>
      </section>

      {/* 3. Vocabulary Section */}
      {parsedData.vocabulary.length > 0 && (
          <section className="space-y-4">
             <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-6">
                <h3 className="text-xl font-bold text-[#396A84] dark:text-[#5DA8C9]">
                    Vocabulary
                </h3>
            </div>
            <div className="w-full">
                {parsedData.vocabulary.map((item, idx) => (
                    <div key={idx} className="flex border-b border-slate-100 dark:border-slate-800 py-3 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors px-2 rounded">
                        <div className="w-8 text-slate-300 dark:text-slate-600 text-xs pt-1">{item.no}</div>
                        <div className="w-1/3 font-semibold text-slate-800 dark:text-slate-200">{item.word}</div>
                        <div className="flex-1 text-slate-600 dark:text-slate-400 text-sm">{item.meaning}</div>
                    </div>
                ))}
            </div>
          </section>
      )}

      {/* 4. Key Sentence Section */}
      {parsedData.keySentence.english && (
          <section className="space-y-4 pt-4">
             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-8 text-center border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm uppercase tracking-widest text-[#396A84] dark:text-[#5DA8C9] font-semibold mb-4">
                    Key Sentence
                </h3>
                <p className="text-2xl font-sans text-slate-900 dark:text-white mb-3 italic font-medium">
                    "{parsedData.keySentence.english}"
                </p>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-light">
                    {parsedData.keySentence.korean}
                </p>
                {parsedData.keySentence.tip && (
                    <div className="inline-block bg-white dark:bg-slate-800 px-4 py-2 rounded border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                        💡 {parsedData.keySentence.tip}
                    </div>
                )}
             </div>
          </section>
      )}
    </div>
  );
};

export default AnalysisResult;