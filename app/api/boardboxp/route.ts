import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function createClient(cookieStore:any){
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies:{
        getAll:()=>cookieStore.getAll(),
        setAll:(cookiesToSet)=>{
          cookiesToSet.forEach(({name,value,options}:any)=>{
            cookieStore.set(name,value,options);
          });
        },
      },
    }
  );
}

export async function GET() {

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data:{ user } } = await supabase.auth.getUser();

  if(!user){
    return Response.json({error:"not authenticated"},{status:401});
  }

  // jogos que já foram jogados
  const { data: jogos } = await supabase
    .rpc("jogos_jogados");

  // ranking salvo
  const { data: ranking } = await supabase
    .from("ranking_jogos_usuario")
    .select("jogo_id,posicao")
    .eq("user_id", user.id)
    .order("posicao");

  return Response.json({
    jogos: jogos ?? [],
    ranking: ranking ?? []
  });
}

export async function POST(req:Request){

  const body = await req.json();
  const ranking = body.ranking ?? [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data:{ user } } = await supabase.auth.getUser();

  if(!user){
    return Response.json({error:"not authenticated"},{status:401});
  }

  // remove ranking antigo
  await supabase
    .from("ranking_jogos_usuario")
    .delete()
    .eq("user_id", user.id);

  const inserts = ranking.map((jogo:any,index:number)=>({
    user_id:user.id,
    jogo_id:jogo.id,
    posicao:index+1
  }));

  if(inserts.length > 0){

    const { error } = await supabase
      .from("ranking_jogos_usuario")
      .insert(inserts);

    if(error){
      return Response.json({error:error.message},{status:500});
    }

  }

  return Response.json({success:true});
}