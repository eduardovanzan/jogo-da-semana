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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // 🔐 Verifica usuário autenticado
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

  // 🛑 Valida estrutura
  if (!Array.isArray(ranking) || ranking.length === 0) {
    return NextResponse.json(
      { error: "Ranking inválido" },
      { status: 400 }
    );
  }

  // 🛑 Verifica se todos são números
  if (!ranking.every((id) => typeof id === "number")) {
    return NextResponse.json(
      { error: "Formato inválido de ranking" },
      { status: 400 }
    );
  }

  // 🛑 Verifica duplicidade
  const unicos = new Set(ranking);
  if (unicos.size !== ranking.length) {
    return NextResponse.json(
      { error: "Jogos duplicados no ranking" },
      { status: 400 }
    );
  }

  // 🔎 Verifica se os jogos existem na semana
  const { data: jogosSemana, error: erroSemana } =
    await supabase
      .from("escolhas_semana")
      .select("jogo_id");

  if (erroSemana) {
    return NextResponse.json(
      { error: erroSemana.message },
      { status: 500 }
    );
  }

  const idsValidos = jogosSemana?.map((j) => j.jogo_id) || [];

  const rankingValido = ranking.every((id) =>
    idsValidos.includes(id)
  );

  if (!rankingValido) {
    return NextResponse.json(
      { error: "Ranking contém jogos inválidos" },
      { status: 400 }
    );
  }

  // 🧹 Remove votos anteriores do usuário
  const { error: deleteError } = await supabase
    .from("votos")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  // 📥 Insere novos votos
  const votosParaInserir = ranking.map(
    (jogo_id: number, index: number) => ({
      user_id: user.id,
      jogo_id,
      posicao: index + 1,
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
