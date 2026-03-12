"use client";

import { useEffect,useState } from "react";
import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

export default function BoardBoxRanking(){

  const [ranking,setRanking] = useState<any[]>([]);
  const [novos,setNovos] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    carregar();
  },[]);

  async function carregar(){

    const res = await fetch("/api/boardboxp");
    const data = await res.json();

    const jogos = data.jogos;
    const rankingSalvo = data.ranking;

    const mapa = new Map(
      rankingSalvo.map((r:any)=>[r.jogo_id,r.posicao])
    );

    const ranqueados:any[]=[];
    const naoRanqueados:any[]=[];

    jogos.forEach((j:any)=>{
      if(mapa.has(j.id)){
        ranqueados.push({
          ...j,
          posicao:mapa.get(j.id)
        });
      }else{
        naoRanqueados.push(j);
      }
    });

    ranqueados.sort((a,b)=>a.posicao-b.posicao);

    setRanking(ranqueados);
    setNovos(naoRanqueados);

    setLoading(false);
  }

  function handleDragEnd(event:any){

    const {active,over} = event;

    if(active.id!==over.id){

      const oldIndex = ranking.findIndex(i=>i.id===active.id);
      const newIndex = ranking.findIndex(i=>i.id===over.id);

      setRanking(arrayMove(ranking,oldIndex,newIndex));
    }
  }

  async function salvar(){

    await fetch("/api/boardboxp",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ranking})
    });

    alert("Ranking salvo!");
  }

  if(loading){
    return <div className="text-white">Carregando...</div>
  }

  return(

  <div className="min-h-screen bg-slate-900 text-white p-10">

    <h1 className="text-3xl font-bold mb-8">
      Meu Ranking de Jogos
    </h1>

    {novos.length>0 && (

      <div className="mb-10">

        <h2 className="text-xl mb-4">
          Jogos ainda não ranqueados
        </h2>

        <div className="flex flex-wrap gap-3">

          {novos.map(j=>(
            <button
              key={j.id}
              onClick={()=>{
                setRanking([...ranking,j]);
                setNovos(novos.filter(n=>n.id!==j.id));
              }}
              className="bg-yellow-600 px-3 py-2 rounded"
            >
              {j.name}
            </button>
          ))}

        </div>
      </div>
    )}

    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >

      <SortableContext
        items={ranking.map(r=>r.id)}
        strategy={verticalListSortingStrategy}
      >

        <div className="flex flex-col gap-3">

          {ranking.map((j,i)=>(
            <div
              key={j.id}
              id={j.id}
              className="bg-slate-800 p-4 rounded"
            >
              #{i+1} — {j.name}
            </div>
          ))}

        </div>

      </SortableContext>

    </DndContext>

    <button
      onClick={salvar}
      className="mt-8 bg-green-600 px-6 py-3 rounded"
    >
      Salvar Ranking
    </button>

  </div>

  )
}