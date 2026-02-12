import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { jogos } = await req.json();

  const { error } = await supabase
    .from("jogos")
    .insert(jogos.map((nome: string) => ({ nome })));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const { data } = await supabase
    .from("jogos")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json(data);
}
