import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eiygbtpsfumwvhzbudij.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWdidHBzZnVtd3ZoemJ1ZGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTgxMjUsImV4cCI6MjA4Nzk5NDEyNX0.qrIkEt-ZOIIs8-isz5qYaFZWEeVfYXqH6nir1u0vtrE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
