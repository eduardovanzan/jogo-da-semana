import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jogo_id = searchParams.get("jogo_id");

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

  let rankingQuery;

  if (jogo_id) {
    rankingQuery = supabase
      .from("ranking_usuarios")
      .select("*")
      .eq("jogo_id", jogo_id);
  } else {
    rankingQuery = supabase
      .from("ranking_usuarios_total")
      .select("*");
  }

  const { data: ranking, error } = await rankingQuery
    .order("primeiros", { ascending: false })
    .order("segundos", { ascending: false })
    .order("terceiros", { ascending: false })
    .order("total_partidas", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // 🔥 Buscar apenas jogos que possuem partidas
  const { data: jogos } = await supabase
    .from("partidas")
    .select("jogo_id, jogos ( id, name )")
    .not("jogo_id", "is", null);

  const jogosUnicos =
    jogos?.reduce((acc: any[], curr: any) => {
      if (!acc.find((j) => j.id === curr.jogos.id)) {
        acc.push(curr.jogos);
      }
      return acc;
    }, []) ?? [];

  return Response.json({
    ranking: ranking ?? [],
    jogos: jogosUnicos,
  });
}