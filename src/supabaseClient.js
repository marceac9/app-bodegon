import { createClient } from '@supabase/supabase-js';

// ESQUIVAMOS EL .ENV Y PONEMOS LAS LLAVES DIRECTO:
const supabaseUrl = 'https://ripoavnholihdfkaihpv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpcG9hdm5ob2xpaGRma2FpaHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MjI0NjAsImV4cCI6MjEwMDQ5ODQ2MH0.MfiRe05f_gIFWZQ8pwb9MvMoYDt9ofzs-1AV22SJJG0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);