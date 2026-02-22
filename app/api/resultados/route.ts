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
    .select("id, numero")
    .eq("ativa", true)
    .single();

  if (erroSemana || !semana) {
    return NextResponse.json(
      { error: "Nenhuma semana ativa" },
      { status: 400 }
    );
  }

  // 🔎 Buscar votos da semana ativa
  const { data: votos, error } = await supabase
    .from("votos")
    .select("posicao, jogos(id, name)")
    .eq("semana_id", semana.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const mapa: Record<
    number,
    { id: number; name: string; pontos: number }
  > = {};

  function calcularPontos(posicao: number) {
    if (posicao <= 3) return 4;
    if (posicao <= 6) return 3;
    if (posicao <= 9) return 2;
    return 1;
  }

  votos?.forEach((v: any) => {
    if (!v.jogos) return;

    const pontos = calcularPontos(v.posicao);

    if (!mapa[v.jogos.id]) {
      mapa[v.jogos.id] = {
        id: v.jogos.id,
        name: v.jogos.name,
        pontos: 0,
      };
    }

    mapa[v.jogos.id].pontos += pontos;
  });

  const rankingFinal = Object.values(mapa).sort(
    (a, b) => b.pontos - a.pontos
  );

  return NextResponse.json({
    semana,
    resultados: rankingFinal,
  });
}