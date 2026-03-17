"use client";

import { useEffect, useState } from "react";

function medalha(i: number) {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return `#${i + 1}`;
}

export default function RankingGlobal() {

  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const res = await fetch("/api/ranking-global");
      const data = await res.json();
      setRanking(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-white">
        Carregando ranking...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-12">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-10">
          Ranking Global dos Jogos
        </h1>

        <div className="flex flex-col gap-4">

          {ranking.map((jogo, index) => (

            <div
              key={jogo.jogo_id}
              className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500/40 transition"
            >

              <div className="text-2xl font-bold w-10 text-blue-400">
                {medalha(index)}
              </div>

              <div className="flex-1">

                <div className="font-semibold text-lg">
                  {jogo.nome}
                </div>

                <div className="text-sm text-gray-400 flex gap-3 mt-1">
                  <span>🥇 {jogo.primeiros}</span>
                  <span>🥈 {jogo.segundos}</span>
                  <span>🥉 {jogo.terceiros}</span>
                </div>

              </div>

              <div className="text-right">

                <div className="text-xl font-bold text-green-400">
                  {jogo.score}
                </div>

                <div className="text-xs text-gray-400">
                  pontos
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}