"use client";

import { useEffect, useState } from "react";

export default function Ranking() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [jogos, setJogos] = useState<any[]>([]);
  const [jogoSelecionado, setJogoSelecionado] = useState("");
  const [loading, setLoading] = useState(true);

  async function carregarRanking(jogoId?: string) {
    setLoading(true);

    const url = jogoId
      ? `/api/ranking?jogo_id=${jogoId}`
      : `/api/ranking`;

    const res = await fetch(url);
    const data = await res.json();

    setRanking(data.ranking ?? []);
    setJogos(data.jogos ?? []);
    setLoading(false);
  }

  useEffect(() => {
    carregarRanking(); // 🔥 já carrega geral
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        <h1 className="text-3xl font-bold text-center">
          Ranking de Vitórias
        </h1>

        {/* Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-300 text-sm">
            Filtrar por jogo
          </label>

          <select
            value={jogoSelecionado}
            onChange={(e) => {
              const value = e.target.value;
              setJogoSelecionado(value);
              carregarRanking(value || undefined);
            }}
            className="bg-slate-800 border border-slate-600 p-3 rounded-lg"
          >
            <option value="">Todos os jogos</option>
            {jogos.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ranking */}
        {loading ? (
          <div className="text-center text-gray-400">
            Carregando...
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center text-gray-400">
            Nenhum dado disponível.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {ranking.map((user, index) => (
              <div
                key={user.conta_id}
                className="bg-slate-800/70 border border-slate-700 rounded-xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center">

                  <div>
                    <h2 className="text-xl font-semibold">
                      #{index + 1} — {user.nome}
                    </h2>

                    <div className="mt-2 flex gap-6 text-lg">
                      <span>🥇 {user.primeiros}</span>
                      <span>🥈 {user.segundos}</span>
                      <span>🥉 {user.terceiros}</span>
                      <span className="text-gray-400">
                        🎮 {user.total_partidas}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}