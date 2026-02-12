import { createClient } from "@supabase/supabase-js";

// pega variáveis do .env / Vercel
const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

// validação de segurança (evita app quebrar silenciosamente)
if (!url || !anonKey) {
  throw new Error(
    "Variáveis do Supabase não configuradas. Verifique SUPABASE_URL e SUPABASE_ANON_KEY."
  );
}

// cliente server-side
export const supabase = createClient(url, anonKey);