import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function createClient(cookieStore: any) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const tipo = searchParams.get("tipo") || "tempo";
    const page = Number(searchParams.get("page") || "1");
    const limit = 10;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "not authenticated" }, { status: 401 });
    }

    let query = supabase
      .from("partidas")
      .select(`
        jogo_id,
        jogos (
          id,
          name
        ),
        duracao_minutos
      `);

    const { data, error } = await query;

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // 🔥 agregação no backend (simples e flexível)
    const mapa: Record<string, any> = {};

    data.forEach((p: any) => {
      const jogo = p.jogos;
      if (!jogo) return;

      if (!mapa[jogo.id]) {
        mapa[jogo.id] = {
          id: jogo.id,
          nome: jogo.name,
          partidas: 0,
          minutos: 0,
        };
      }

      mapa[jogo.id].partidas += 1;
      mapa[jogo.id].minutos += p.duracao_minutos || 0;
    });

    let lista = Object.values(mapa);

    if (tipo === "tempo") {
      lista = lista.map((j: any) => ({
        id: j.id,
        nome: j.nome,
        valor: j.minutos / 60,
      }));
      lista.sort((a: any, b: any) => b.valor - a.valor);
    } else {
      lista = lista.map((j: any) => ({
        id: j.id,
        nome: j.nome,
        valor: j.partidas,
      }));
      lista.sort((a: any, b: any) => b.valor - a.valor);
    }

    // 📊 gráfico (top 5 + outros)
    const top = lista.slice(0, 5);
    const outrosValor = lista
      .slice(5)
      .reduce((acc: number, j: any) => acc + j.valor, 0);

    const grafico = [...top];

    if (outrosValor > 0) {
      grafico.push({
        nome: "Outros",
        valor: outrosValor,
      });
    }

    // 📄 paginação
    const start = (page - 1) * limit;
    const paginada = lista.slice(start, start + limit);

    return Response.json({
      lista: paginada,
      grafico,
      total: lista.length,
    });

  } catch (err: any) {
    console.error(err);
    return Response.json({ error: "erro interno" }, { status: 500 });
  }
}