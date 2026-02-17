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
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // 🔐 pega usuário autenticado corretamente
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

  // 🔥 apaga escolhas antigas do usuário logado
  await supabase
    .from("escolhas_semana")
    .delete()
    .eq("user_id", user.id);

  // 🔥 insere novas
  const { error } = await supabase
    .from("escolhas_semana")
    .insert(
      jogos.map((jogo_id: number) => ({
        user_id: user.id,
        jogo_id,
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