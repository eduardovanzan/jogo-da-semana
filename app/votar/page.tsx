"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type Jogo = {
  id: number;
  name: string;
};

function SortableItem({ jogo, index }: { jogo: Jogo; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: jogo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const medalhas = ["🥇", "🥈", "🥉"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-xl shadow-md 
                 flex items-center justify-between 
                 cursor-grab active:cursor-grabbing"
    >
      <span className="font-semibold text-slate-700">
        {medalhas[index] || `${index + 1}º`} Lugar
      </span>

      <span className="text-slate-800 font-medium">
        {jogo.name}
      </span>
    </div>
  );
}

export default function VotarPage() {
  const router = useRouter();
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Agora busca tudo via backend
  useEffect(() => {
    async function carregarJogos() {
      try {
        const res = await fetch("/api/votar");
        const data = await res.json();

        if (!res.ok) {
          setErro(data.error);
          return;
        }

        setJogos(data.jogos);
      } catch {
        setErro("Erro ao carregar jogos");
      } finally {
        setLoading(false);
      }
    }

    carregarJogos();
  }, []);

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setJogos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  async function enviarVotacao() {
    const ranking = jogos.map((j) => j.id);

    const res = await fetch("/api/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ranking }),
    });

    const resultado = await res.json();

    if (!res.ok) {
      setErro(resultado.error);
      return;
    }

    alert("Votação enviada com sucesso!");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">

        <div className="text-center text-white">
          <h1 className="text-3xl font-bold">
            Ranking da Semana
          </h1>
          <p className="text-slate-300 mt-2">
            Arraste os jogos para ordenar sua prioridade
          </p>
        </div>

        {erro && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {erro}
          </div>
        )}

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={jogos.map((j) => j.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {jogos.map((jogo, index) => (
                <SortableItem
                  key={jogo.id}
                  jogo={jogo}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          onClick={enviarVotacao}
          className="w-full bg-blue-600 hover:bg-blue-700 
                     text-white font-semibold py-3 rounded-xl 
                     transition duration-200 shadow-md hover:shadow-lg"
        >
          Enviar Ranking
        </button>

      </div>
    </div>
  );
}