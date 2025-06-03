import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ogwbuekuevwwgwudhhni.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2J1ZWt1ZXZ3d2d3dWRoaG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1OTAwMTAsImV4cCI6MjA2NDE2NjAxMH0.iUWaoR-2ovErRSlCct--UxMfcWNWg4ZJe1pIOGv5O8M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);