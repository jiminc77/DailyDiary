export interface DiaryEntry {
  id: string;
  date: string;
  originalText: string;
  analysisRaw: string;
}

export interface ParsedAnalysis {
  nativeVersion: string;
  feedback: string[];
  vocabulary: { no: string; word: string; meaning: string }[];
  keySentence: {
    english: string;
    korean: string;
    tip: string;
  };
}
