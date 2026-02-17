"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type Resultado = {
  id: number;
  name: string;
  pontos: number;
};

export default function ResultadosPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarResultados() {
      // busca votos com jogo relacionado
      const { data } = await supabase
        .from("votos")
        .select("posicao, jogos(id, name)");

      if (!data) return;

      const totalJogos = Math.max(
        ...data.map((v) => v.posicao)
      );

      const mapa: Record<number, Resultado> = {};

      data.forEach((v: any) => {
        if (!v.jogos) return;

        const pontos = totalJogos - v.posicao + 1;

        if (!mapa[v.jogos.id]) {
          mapa[v.jogos.id] = {
            id: v.jogos.id,
            name: v.jogos.name,
            pontos: 0,
          };
        }

        mapa[v.jogos.id].pontos += pontos;
      });

      const rankingFinal = Object.values(mapa).sort(
        (a, b) => b.pontos - a.pontos
      );

      setResultados(rankingFinal);
      setLoading(false);
    }

    carregarResultados();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Carregando resultados...
      </div>
    );
  }

  const medalhas = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">
            Resultado da Semana
          </h1>
          <p className="text-slate-300 mt-2">
            Ranking geral baseado nas votações
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
          {resultados.map((jogo, index) => (
            <div
              key={jogo.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {medalhas[index] || `${index + 1}º`}
                </span>

                <span className="font-semibold text-slate-800">
                  {jogo.name}
                </span>
              </div>

              <span className="font-bold text-blue-600">
                {jogo.pontos} pts
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
