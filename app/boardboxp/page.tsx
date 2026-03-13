"use client";

import { useEffect, useState } from "react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function medalha(index:number){

  if(index===0) return "🥇";
  if(index===1) return "🥈";
  if(index===2) return "🥉";

  return `#${index+1}`;
}

function SortableItem({jogo,index,remover}:any){

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({id:jogo.id});

  const style = {
    transform:CSS.Transform.toString(transform),
    transition
  };

  return(

    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-blue-500/40 transition group"
    >

      <div className="text-2xl w-10 font-bold text-blue-400">
        {medalha(index)}
      </div>

      <div className="flex-1 font-semibold">
        {jogo.name}
      </div>

      <button
        onClick={()=>remover(jogo)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition"
      >
        ✕
      </button>

      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-white text-xl ml-2"
      >
        ☰
      </div>

    </div>

  );
}

export default function BoardBoxRanking(){

  const [ranking,setRanking] = useState<any[]>([]);
  const [novos,setNovos] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

    useEffect(()=>{
        carregar();
    },[]);

    useEffect(()=>{

    if(loading) return;

    const t = setTimeout(()=>{
        salvarAutomatico();
    },800);

    return ()=>clearTimeout(t);

    },[ranking]);

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

  function removerDoRanking(jogo:any){

    setRanking(ranking.filter(j=>j.id!==jogo.id));
    setNovos([...novos,jogo]);
  }

    function adicionarAoRanking(jogo:any){

    setNovos(prev=>prev.filter(n=>n.id!==jogo.id));
    setRanking(prev=>[...prev,jogo]);

    }

    function handleDragEnd(event:any){

    const {active,over} = event;

    if(!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeRanking = ranking.find(j=>j.id===activeId);
    const activeNovo = novos.find(j=>j.id===activeId);

    // mover dentro do ranking
    if(activeRanking && ranking.find(j=>j.id===overId)){

        const oldIndex = ranking.findIndex(j=>j.id===activeId);
        const newIndex = ranking.findIndex(j=>j.id===overId);

        setRanking(arrayMove(ranking,oldIndex,newIndex));
        return;
    }

    // mover de novos para ranking
    if(activeNovo){

        setNovos(novos.filter(j=>j.id!==activeId));
        setRanking([...ranking,activeNovo]);
    }

    }

  async function salvarAutomatico(){

    setSaving(true);

    await fetch("/api/boardboxp",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({ranking})
    });

    setSaving(false);
  }

  if(loading){

    return(
      <div className="text-white p-10">
        Carregando ranking...
      </div>
    );

  }

  return(

  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-12">

    <div className="max-w-3xl mx-auto">

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-3xl font-bold">
          Meu Ranking de Jogos
        </h1>

        {saving && (
          <span className="text-sm text-gray-400">
            salvando...
          </span>
        )}

      </div>

      {novos.length>0 && (

        <div className="mb-10">

          <h2 className="text-lg font-semibold mb-4 text-yellow-400">
            Jogos ainda não ranqueados
          </h2>

          <div className="flex flex-wrap gap-3">

            {novos.map((j)=>(
              <button
                key={j.id}
                onClick={()=>adicionarAoRanking(j)}
                className="cursor-pointer bg-yellow-600 hover:bg-yellow-500 transition px-4 py-2 rounded-lg font-medium shadow"
              >
                {j.name}
              </button>
            ))}

          </div>

        </div>

      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >

        <SortableContext
          items={ranking.map(r=>r.id)}
          strategy={verticalListSortingStrategy}
        >

          <div className="flex flex-col gap-3">

            {ranking.map((jogo,index)=>(
              <SortableItem
                key={jogo.id}
                jogo={jogo}
                index={index}
                remover={removerDoRanking}
              />
            ))}

          </div>

        </SortableContext>

      </DndContext>

      {ranking.length===0 && (

        <div className="text-center text-gray-400 mt-10">
          Adicione jogos ao ranking
        </div>

      )}

    </div>

  </div>

  );

}