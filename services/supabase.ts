import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vuhbxceybywwnwzfsvpg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aGJ4Y2V5Ynl3d253emZzdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTYyNjQsImV4cCI6MjA3NzE3MjI2NH0.dvhx9PtbMv0yBu8OVj36wi5KkQeHzt3wFpEAiyhGIG0';

export const supabase = createClient(supabaseUrl, supabaseKey);
