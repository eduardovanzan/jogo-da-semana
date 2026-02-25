import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ no Next 15 é async

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase
      .from("contas")
      .select("id, nome")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro Supabase GET:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data ?? []);
  } catch (err: any) {
    console.error("Erro geral GET:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data_partida, resultados } = body;

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // 1️⃣ Criar partida
    const { data: partida, error: partidaError } = await supabase
      .from("partidas")
      .insert({ data_partida })
      .select()
      .single();

    if (partidaError) {
      console.error("Erro ao criar partida:", partidaError);
      return Response.json({ error: partidaError.message }, { status: 500 });
    }

    // 2️⃣ Inserir resultados
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
      console.error("Erro ao inserir resultados:", resultadosError);
      return Response.json({ error: resultadosError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Erro geral POST:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}