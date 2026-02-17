import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const { data, error } = await supabaseServer
    .from("jogos")
    .select("id, name, rank")
    .ilike("name", `%${q}%`)
    .order("bayesaverage", { ascending: false})
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
