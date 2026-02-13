import { createClient } from "@supabase/supabase-js";

// pega variáveis do .env / Vercel
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// validação de segurança (evita app quebrar silenciosamente)
if (!url || !serviceRoleKey) {
  throw new Error(
    "Variáveis do Supabase não configuradas. Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
  );
}

// cliente server-side
export const supabaseServer = createClient(url, serviceRoleKey);