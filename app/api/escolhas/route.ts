import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type Body = {
  usuario_id: string;
  jogos: number[]; // ids dos jogos
};

export async function POST(req: Request) {
  const body: Body = await req.json();
  const { usuario_id, jogos } = body;

  if (!usuario_id || !Array.isArray(jogos) || jogos.length !== 3) {
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

  // apaga antigas
  await supabase
    .from("escolhas_semana")
    .delete()
    .eq("usuario_id", usuario_id);

  // insere novas
  const { error } = await supabase
    .from("escolhas_semana")
    .insert(
      jogos.map((jogo_id) => ({
        usuario_id,
        jogo_id,
      }))
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
