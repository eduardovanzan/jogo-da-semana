import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // 🔎 Buscar semana ativa
  const { data: semana, error: erroSemana } = await supabase
    .from("semanas")
    .select("id")
    .eq("ativa", true)
    .single();

  if (erroSemana || !semana) {
    return NextResponse.json(
      { error: "Nenhuma semana ativa" },
      { status: 400 }
    );
  }

  // 🔎 Buscar jogos únicos da semana ativa
  const { data, error } = await supabase
    .from("escolhas_semana")
    .select("jogos(id, name)")
    .eq("semana_id", semana.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // 🔥 Remove duplicados
  const mapa = new Map<number, { id: number; name: string }>();

  data?.forEach((item: any) => {
    if (item.jogos) {
      mapa.set(item.jogos.id, item.jogos);
    }
  });

  return NextResponse.json({
    jogos: Array.from(mapa.values()),
  });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // 🔐 Usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  const { ranking } = await req.json();

  if (!Array.isArray(ranking) || ranking.length === 0) {
    return NextResponse.json(
      { error: "Ranking inválido" },
      { status: 400 }
    );
  }

  // 🔎 Buscar semana ativa
  const { data: semana, error: erroSemana } = await supabase
    .from("semanas")
    .select("id")
    .eq("ativa", true)
    .single();

  if (erroSemana || !semana) {
    return NextResponse.json(
      { error: "Nenhuma semana ativa" },
      { status: 400 }
    );
  }

  // 🔎 Buscar jogos válidos da semana
  const { data: jogosSemana } = await supabase
    .from("escolhas_semana")
    .select("jogo_id")
    .eq("semana_id", semana.id);

  const idsValidos = jogosSemana?.map((j) => j.jogo_id) || [];

  const rankingValido = ranking.every((id: number) =>
    idsValidos.includes(id)
  );

  if (!rankingValido) {
    return NextResponse.json(
      { error: "Ranking contém jogos inválidos" },
      { status: 400 }
    );
  }

  // 🧹 Remove votos apenas dessa semana
  const { error: deleteError } = await supabase
    .from("votos")
    .delete()
    .eq("user_id", user.id)
    .eq("semana_id", semana.id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  // 📥 Insere novos votos com semana_id
  const votosParaInserir = ranking.map(
    (jogo_id: number, index: number) => ({
      user_id: user.id,
      jogo_id,
      posicao: index + 1,
      semana_id: semana.id,
    })
  );

  const { error: insertError } = await supabase
    .from("votos")
    .insert(votosParaInserir);

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}