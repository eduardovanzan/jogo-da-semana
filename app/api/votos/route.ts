import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

type Body = {
  usuario_id: string;
  jogos: number[];
};

export async function POST(req: Request) {
  const body: Body = await req.json();
  const { usuario_id, jogos } = body;

  if (!usuario_id || !Array.isArray(jogos) || jogos.length > 2) {
    return NextResponse.json(
      { error: "Máximo de 2 votos" },
      { status: 400 }
    );
  }

  const unicos = [...new Set(jogos)];

  await supabaseServer
    .from("votos")
    .delete()
    .eq("usuario_id", usuario_id);

  const { error } = await supabaseServer
    .from("votos")
    .insert(
      unicos.map((jogo_id) => ({
        usuario_id,
        jogo_id,
      }))
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
