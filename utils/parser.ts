import { ParsedAnalysis } from '../types';

export const parseAnalysisResult = (rawMarkdown: string): ParsedAnalysis => {
  const result: ParsedAnalysis = {
    nativeVersion: '',
    feedback: [],
    vocabulary: [],
    keySentence: { english: '', korean: '', tip: '' },
  };

  if (!rawMarkdown) return result;

  // Helper to find content between headers safely
  const extractSection = (headerPattern: RegExp, nextHeaderPattern: RegExp | null) => {
    const match = rawMarkdown.match(new RegExp(`${headerPattern.source}(.*?)${nextHeaderPattern ? '(?=' + nextHeaderPattern.source + ')' : '($)'}`, 's'));
    return match ? match[1].trim() : '';
  };

  // 1. Native Version
  // Look for "Native Version" header
  // Use [^\n]* to match the rest of the header line, ensuring we don't consume the content
  let nativeText = extractSection(/###\s*Native Version[^\n]*/, /###/);
  nativeText = nativeText.replace(/^>\s*/gm, '').trim();
  result.nativeVersion = nativeText;

  // 2. Feedback
  // Look for "Grammar & Feedback" or just "Feedback" or "Grammer" (common typo)
  const feedbackText = extractSection(/###\s*(?:Grammar|Grammer|Feedback)[^\n]*/, /###/);
  if (feedbackText) {
    result.feedback = feedbackText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (
          line.startsWith('*') || 
          line.startsWith('-') || 
          /^\d+\./.test(line) || 
          line.includes('->') || 
          line.includes('→')
      ))
      .map(line => line.replace(/^[\*\-]\s*/, '').replace(/^\d+\.\s*/, ''));
  }

  // 3. Vocabulary
  // Look for "Vocabulary"
  const vocabText = extractSection(/###\s*Vocabulary[^\n]*/, /###/);
  if (vocabText) {
     const rows = vocabText.split('\n').filter(row => row.trim().startsWith('|'));
     // Skip header row and separator row
     const dataRows = rows.filter(row => !row.includes('---') && !row.toLowerCase().includes('word'));
     
     result.vocabulary = dataRows.map(row => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 2) {
           if (cells.length === 3) return { no: cells[0], word: cells[1], meaning: cells[2] };
           if (cells.length === 2) return { no: '-', word: cells[0], meaning: cells[1] };
        }
        return null;
     }).filter(item => item !== null) as any[];
  }

  // 4. Key Sentence
  // Look for "Key Sentence"
  const keyText = extractSection(/###\s*Key Sentence[^\n]*/, /###/);
  if (keyText) {
      const lines = keyText.split('\n').filter(l => l.trim());
      let english = '';
      let korean = '';
      let tip = '';

      lines.forEach(line => {
          const cleanLine = line.replace(/^>\s*/, '').trim(); 
          if (cleanLine.startsWith('**') && cleanLine.endsWith('**')) {
               english = cleanLine.replace(/\*\*/g, '').replace(/"/g, '');
          } else if (cleanLine.startsWith('"') && cleanLine.endsWith('"')) {
               english = cleanLine.replace(/"/g, '');
          } else if (cleanLine.startsWith('*')) {
               tip = cleanLine.replace(/^\*\s*/, '').replace(/\*\*/g, '');
          } else if (!english && cleanLine.match(/^[A-Za-z]/)) {
               // Heuristic: if it starts with English letter and we don't have english yet
               english = cleanLine.replace(/\*\*/g, '').replace(/"/g, '');
          } else {
               korean = cleanLine;
          }
      });
      
      result.keySentence = { english, korean, tip };
  }

  return result;
};
