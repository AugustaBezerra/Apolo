import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gbdjqossrhoksuxohtps.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Dzs1waa6_2hkhuU6Z0utyw_h8C_vsNp";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
