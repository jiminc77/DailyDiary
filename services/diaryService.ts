import { supabase } from './supabaseClient';

export interface DiaryEntry {
  id: string;
  user_id: string;
  date: string;
  title: string;
  original_content: string;
  analysis_result: string;
  created_at: string;
}

export const diaryService = {
  async getDiaryByDate(date: string) {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      throw error;
    }

    return data as DiaryEntry | null;
  },

  async saveDiary(date: string, title: string, content: string, result: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('diaries')
      .upsert({
        user_id: user.id,
        date,
        title,
        original_content: content,
        analysis_result: result,
      }, { onConflict: 'user_id, date' })
      .select()
      .single();

    if (error) throw error;
    return data as DiaryEntry;
  }
};
