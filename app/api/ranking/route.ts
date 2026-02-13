import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type VotoJoin = {
  jogo_id: number;
  jogos: {
    id: number;
    nome: string;
  }[]; // ← ARRAY (importante)
};

export async function GET() {
  const { data, error } = await supabaseServer
    .from("votos")
    .select(`
      jogo_id,
      jogos ( id, nome )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const contagem: Record<number, { nome: string; votos: number }> = {};

  (data as VotoJoin[] | null)?.forEach((v) => {
    const jogo = v.jogos?.[0]; // ← pega primeiro item do array

    if (!jogo) return;

    const id = jogo.id;

    if (!contagem[id]) {
      contagem[id] = {
        nome: jogo.nome,
        votos: 0,
      };
    }

    contagem[id].votos++;
  });

  const ranking = Object.values(contagem)
    .sort((a, b) => b.votos - a.votos);

  return NextResponse.json({
    ranking,
    top2: ranking.slice(0, 2),
  });
}
