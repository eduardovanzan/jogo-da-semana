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

  // 🔐 usuário autenticado
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

  // 🟢 1️⃣ Buscar semana ativa
  const { data: semanaAtiva, error: erroSemana } = await supabase
    .from("semanas")
    .select("id")
    .eq("ativa", true)
    .single();

  if (erroSemana || !semanaAtiva) {
    return NextResponse.json(
      { error: "Nenhuma semana ativa encontrada" },
      { status: 400 }
    );
  }

  // 🔥 2️⃣ Apagar apenas escolhas da semana ativa
  const { error: deleteError } = await supabase
    .from("escolhas_semana")
    .delete()
    .eq("user_id", user.id)
    .eq("semana_id", semanaAtiva.id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  // 🔥 3️⃣ Inserir novas escolhas com semana_id
  const { error: insertError } = await supabase
    .from("escolhas_semana")
    .insert(
      jogos.map((jogo_id: number) => ({
        user_id: user.id,
        jogo_id,
        semana_id: semanaAtiva.id,
      }))
    );

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
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

  // 🔐 usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // 🟢 Buscar semana ativa
  const { data: semana, error: erroSemana } = await supabase
    .from("semanas")
    .select("id, numero")
    .eq("ativa", true)
    .single();

  if (erroSemana || !semana) {
    return NextResponse.json(
      { error: "Nenhuma semana ativa" },
      { status: 400 }
    );
  }

  // 🔵 Suas escolhas
  const { data: minhas } = await supabase
    .from("escolhas_semana")
    .select("jogos(id, name)")
    .eq("user_id", user.id)
    .eq("semana_id", semana.id);

  const minhasEscolhas =
    minhas?.map((e: any) => e.jogos).filter(Boolean) || [];

  // 🔥 Escolhas dos outros usuários
  const { data: todas } = await supabase
    .from("escolhas_semana")
    .select(`
      user_id,
      jogos(id, name),
      contas(nome)
    `)
    .eq("semana_id", semana.id);

  const mapa: Record<
    string,
    { nome: string; jogos: { id: number; name: string }[] }
  > = {};

  todas?.forEach((item: any) => {
    if (item.user_id === user.id) return;

    if (!mapa[item.user_id]) {
      mapa[item.user_id] = {
        nome: item.contas?.nome || "Usuário",
        jogos: [],
      };
    }

    if (item.jogos) {
      mapa[item.user_id].jogos.push(item.jogos);
    }
  });

  return NextResponse.json({
    semana,
    minhasEscolhas,
    escolhasUsuarios: Object.values(mapa),
  });
}