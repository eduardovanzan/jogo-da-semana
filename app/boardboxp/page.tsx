"use client";

import { useEffect, useState } from "react";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ jogo, index }: any) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: jogo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-blue-500/50 transition"
    >
      <div className="text-2xl font-bold text-blue-400 w-10">
        #{index + 1}
      </div>

      <div className="flex-1 font-semibold">
        {jogo.name}
      </div>

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

export default function BoardBoxRanking() {

  const [ranking, setRanking] = useState<any[]>([]);
  const [novos, setNovos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const res = await fetch("/api/boardboxp");
    const data = await res.json();

    const jogos = data.jogos;
    const rankingSalvo = data.ranking;

    const mapa = new Map(
      rankingSalvo.map((r: any) => [r.jogo_id, r.posicao])
    );

    const ranqueados: any[] = [];
    const naoRanqueados: any[] = [];

    jogos.forEach((j: any) => {

      if (mapa.has(j.id)) {
        ranqueados.push({
          ...j,
          posicao: mapa.get(j.id),
        });
      } else {
        naoRanqueados.push(j);
      }

    });

    ranqueados.sort((a, b) => a.posicao - b.posicao);

    setRanking(ranqueados);
    setNovos(naoRanqueados);

    setLoading(false);
  }

  function handleDragEnd(event: any) {

    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {

      const oldIndex = ranking.findIndex(
        (i) => i.id === active.id
      );

      const newIndex = ranking.findIndex(
        (i) => i.id === over.id
      );

      setRanking(arrayMove(ranking, oldIndex, newIndex));
    }
  }

  async function salvar() {

    await fetch("/api/boardboxp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ranking }),
    });

    alert("Ranking salvo!");
  }

  if (loading) {
    return (
      <div className="text-white p-10">
        Carregando ranking...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-12">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-10 text-center">
          Meu Ranking de Jogos
        </h1>

        {/* Jogos novos */}

        {novos.length > 0 && (

          <div className="mb-10">

            <h2 className="text-lg font-semibold mb-4 text-yellow-400">
              Jogos ainda não ranqueados
            </h2>

            <div className="flex flex-wrap gap-3">

              {novos.map((j) => (

                <button
                  key={j.id}
                  onClick={() => {
                    setRanking([...ranking, j]);
                    setNovos(
                      novos.filter((n) => n.id !== j.id)
                    );
                  }}
                  className="cursor-pointer bg-yellow-600 hover:bg-yellow-500 transition px-4 py-2 rounded-lg font-medium"
                >
                  {j.name}
                </button>

              ))}

            </div>

          </div>
        )}

        {/* Ranking */}

        <div className="flex flex-col gap-3">

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >

            <SortableContext
              items={ranking.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >

              {ranking.map((jogo, index) => (
                <SortableItem
                  key={jogo.id}
                  jogo={jogo}
                  index={index}
                />
              ))}

            </SortableContext>

          </DndContext>

        </div>

        {/* salvar */}

        <button
          onClick={salvar}
          className="cursor-pointer mt-10 w-full bg-green-600 hover:bg-green-500 transition p-4 rounded-xl font-bold text-lg shadow-lg shadow-green-600/30"
        >
          Salvar Ranking
        </button>

      </div>

    </div>
  );
}