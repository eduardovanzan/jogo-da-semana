"use client";

import { useEffect, useState } from "react";

import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function medalha(i:number){
  if(i===0) return "🥇";
  if(i===1) return "🥈";
  if(i===2) return "🥉";
  return `#${i+1}`;
}

function Card({jogo,index,dragHandle=false,remover}:any){

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({id:jogo.id});

  const style={
    transform:CSS.Transform.toString(transform),
    transition
  };

  return(

    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-blue-500/40 transition group"
    >

      {index!==undefined && (
        <div className="text-2xl font-bold w-10 text-blue-400">
          {medalha(index)}
        </div>
      )}

      <div className="flex-1 font-semibold">
        {jogo.name}
      </div>

      {remover && (
        <button
          onClick={()=>remover(jogo)}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      )}

      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-white text-xl"
      >
        ☰
      </div>

    </div>
  );
}

export default function BoardBoxP(){

  const [ranking,setRanking]=useState<any[]>([]);
  const [novos,setNovos]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [activeItem,setActiveItem]=useState<any>(null);

  const sensors=useSensors(
    useSensor(PointerSensor)
  );

  useEffect(()=>{
    carregar();
  },[]);

  async function carregar(){

    const res=await fetch("/api/boardboxp");
    const data=await res.json();

    const jogos=data.jogos;
    const rankingSalvo=data.ranking;

    const mapa=new Map(
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

  useEffect(()=>{

    if(loading) return;

    const t=setTimeout(()=>{
      salvar();
    },800);

    return()=>clearTimeout(t);

  },[ranking]);

  async function salvar(){

    await fetch("/api/boardboxp",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({ranking})
    });

  }

  function remover(jogo:any){

    setRanking(prev=>prev.filter(j=>j.id!==jogo.id));
    setNovos(prev=>[...prev,jogo]);

  }

  function handleDragStart(event:any){

    const {active}=event;

    const item=
      ranking.find(j=>j.id===active.id) ||
      novos.find(j=>j.id===active.id);

    setActiveItem(item);

  }

  function handleDragEnd(event:any){

    const {active,over}=event;

    setActiveItem(null);

    if(!over) return;

    const activeId=active.id;
    const overId=over.id;

    const activeRanking=ranking.find(j=>j.id===activeId);
    const activeNovo=novos.find(j=>j.id===activeId);

    // reorder ranking
    if(activeRanking && ranking.find(j=>j.id===overId)){

      const oldIndex=ranking.findIndex(j=>j.id===activeId);
      const newIndex=ranking.findIndex(j=>j.id===overId);

      setRanking(arrayMove(ranking,oldIndex,newIndex));
      return;
    }

    // move novo -> ranking
    if(activeNovo){

      setNovos(prev=>prev.filter(j=>j.id!==activeId));
      setRanking(prev=>[...prev,activeNovo]);

    }

  }

  if(loading){
    return <div className="p-10 text-white">Carregando...</div>;
  }

  return(

  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-12">

    <div className="max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-10">
        Meu Ranking de Jogos
      </h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >

        {/* ranking */}

        <SortableContext
          items={ranking.map(j=>j.id)}
          strategy={verticalListSortingStrategy}
        >

          <div className="flex flex-col gap-3 mb-10">

            {ranking.map((jogo,index)=>(
              <Card
                key={jogo.id}
                jogo={jogo}
                index={index}
                remover={remover}
              />
            ))}

          </div>

        </SortableContext>

        {/* jogos novos */}

        {novos.length>0 && (

          <div>

            <h2 className="text-yellow-400 font-semibold mb-4">
              Jogos ainda não ranqueados (arraste para cima para adicionar à lista)
            </h2>

            <SortableContext
              items={novos.map(j=>j.id)}
              strategy={verticalListSortingStrategy}
            >

              <div className="flex flex-col gap-3">

                {novos.map((jogo)=>(
                  <Card
                    key={jogo.id}
                    jogo={jogo}
                  />
                ))}

              </div>

            </SortableContext>

          </div>

        )}

        <DragOverlay>

          {activeItem && (
            <div className="bg-slate-700 p-4 rounded-xl shadow-xl">
              {activeItem.name}
            </div>
          )}

        </DragOverlay>

      </DndContext>

    </div>

  </div>

  );
}