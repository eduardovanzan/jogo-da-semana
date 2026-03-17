import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function createClient(cookieStore: any) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 👤 usuário autenticado (opcional aqui, mas mantém padrão)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "not authenticated" }, { status: 401 });
    }

    // 🔥 query principal (faz tudo no banco)
    const { data, error } = await supabase.rpc("ranking_global_borda");

    if (error) {
      console.error("Erro ranking global:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data ?? []);

  } catch (err: any) {
    console.error("Erro geral:", err);
    return Response.json({ error: "erro interno" }, { status: 500 });
  }
}