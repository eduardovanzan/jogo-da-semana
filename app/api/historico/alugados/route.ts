import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookieStore = await cookies(); // 👈 AGORA É ASYNC

  return createServerClient(
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
}

export async function GET(req: Request) {
  const supabase = await getSupabase(); // 👈 await aqui também
  const { searchParams } = new URL(req.url);
  const semana = searchParams.get("semana");

  // Buscar jogos da semana
  if (semana) {
    const { data, error } = await supabase
      .from("escolhas_semana")
      .select("jogos(id, name)")
      .eq("semana_id", semana);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const jogos = data.map((item: any) => item.jogos);

    return NextResponse.json({ jogos });
  }

  // Buscar lista de alugueis
  const { data, error } = await supabase
    .from("alugueis")
    .select(`
      id,
      jogos(id, name),
      semanas(id, numero, data_inicio, data_fim)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alugueis: data });
}

export async function POST(req: Request) {
  const supabase = await getSupabase(); // 👈 await aqui também
  const body = await req.json();

  const { jogo_id, semana_id } = body;

  const { error } = await supabase
    .from("alugueis")
    .insert({
      jogo_id,
      semana_id,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}