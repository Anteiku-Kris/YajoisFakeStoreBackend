import dotenv from 'dotenv';
import { supabase } from '../services/supabaseClient';

dotenv.config();

export const config = {
    supabaseUrl: process.env.SUPABASE_URL || '3000',
    supabaseKey: process.env.SUPABASE_KEY,
}