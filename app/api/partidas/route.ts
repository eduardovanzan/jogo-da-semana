import { supabaseServer } from "@/lib/supabase-server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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

  const { data, error } = await supabase
    .from("contas")
    .select("id, nome")
    .order("nome", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data_partida, resultados } = body;

  const cookieStore = await cookies();

  const supabase = createServerClient(
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

  // 1️⃣ cria partida
  const { data: partida, error: partidaError } = await supabase
    .from("partidas")
    .insert({ data_partida })
    .select()
    .single();

  if (partidaError) {
    return Response.json({ error: partidaError.message }, { status: 500 });
  }

  // 2️⃣ insere resultados
  const resultadosInsert = resultados.map((r: any) => ({
    partida_id: partida.id,
    conta_id: r.conta_id,
    colocacao: r.colocacao,
    pontuacao: r.pontuacao || null,
  }));

  const { error: resultadosError } = await supabase
    .from("resultados_partida")
    .insert(resultadosInsert);

  if (resultadosError) {
    return Response.json({ error: resultadosError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}