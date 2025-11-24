import React, { useMemo } from 'react';

interface DiaryDisplayProps {
  content: string;
  feedback?: string[];
}

const DiaryDisplay: React.FC<DiaryDisplayProps> = ({ content, feedback = [] }) => {
  
  // Extract original phrases from feedback
  const phrasesToHighlight = useMemo(() => {
    return feedback.map(line => {
        // Expected format: "**Original** -> **Correction**"
        // Handle various arrow types: ->, →, =>
        const parts = line.split(/→|->|=>/);
        if (parts.length > 1) {
            let original = parts[0].trim();
            // Remove markdown bold, italics, quotes, and leading bullets
            original = original
                .replace(/\*\*/g, '')  // Bold
                .replace(/\*/g, '')    // Italic
                .replace(/^[\-\*]\s*/, '') // Leading bullet
                .replace(/^["']|["']$/g, '') // Surrounding quotes
                .trim();
            return original;
        }
        return '';
    }).filter(p => p.length > 2); 
  }, [feedback]);

  const renderHighlightedContent = () => {
    if (!phrasesToHighlight.length) return content;

    // Create a regex pattern to match any of the phrases
    // Escape special regex characters in phrases
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(${phrasesToHighlight.map(escapeRegExp).join('|')})`, 'gi');

    const parts = content.split(pattern);

    return parts.map((part, index) => {
      // Check if this part matches any of our phrases (case insensitive)
      const isHighlight = phrasesToHighlight.some(p => p.toLowerCase() === part.toLowerCase());
      
      if (isHighlight) {
        return (
          <span key={index} className="bg-yellow-200 dark:bg-yellow-900/50 text-slate-900 dark:text-slate-100 px-1 rounded mx-0.5 box-decoration-clone">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <section className="space-y-4 animate-fade-in">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-6">
        <h3 className="text-xl font-bold text-[#396A84] dark:text-[#5DA8C9]">
          Original Version
        </h3>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-lg leading-relaxed whitespace-pre-line font-sans">
        {renderHighlightedContent()}
      </div>
    </section>
  );
};

export default DiaryDisplay;
