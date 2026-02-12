import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/jogos
export async function GET() {
  const { data, error } = await supabase
    .from("jogos")
    .select("name")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
