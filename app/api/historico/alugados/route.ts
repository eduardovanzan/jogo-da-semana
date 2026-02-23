import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { jogos } = body;

  if (!Array.isArray(jogos) || jogos.length !== 3) {
    return NextResponse.json(
      { error: "Envie exatamente 3 jogos" },
      { status: 400 }
    );
  }

  const unicos = [...new Set(jogos)];
  if (unicos.length !== 3) {
    return NextResponse.json(
      { error: "Jogos duplicados não permitidos" },
      { status: 400 }
    );
  }

  // 🔎 Busca semana ativa
  const { data: semanaAtiva, error: semanaError } = await supabase
    .from("semanas")
    .select("id")
    .eq("ativa", true)
    .single();

  if (semanaError || !semanaAtiva) {
    return NextResponse.json(
      { error: "Nenhuma semana ativa encontrada" },
      { status: 400 }
    );
  }

  // 🔥 Deleta apenas escolhas da semana ativa
  await supabase
    .from("escolhas_semana")
    .delete()
    .eq("user_id", user.id)
    .eq("semana_id", semanaAtiva.id);

  // 🔥 Insere novas com semana_id
  const { error } = await supabase
    .from("escolhas_semana")
    .insert(
      jogos.map((jogo_id: number) => ({
        user_id: user.id,
        jogo_id,
        semana_id: semanaAtiva.id,
      }))
    );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}