"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
    const { data } = await supabase
      .from("votos")
      .select("posicao, jogos(id, name)");

    if (!data) return;

    const mapa: Record<number, Resultado> = {};

    // 🔥 função de pontuação por faixa
    function calcularPontos(posicao: number) {
      if (posicao <= 3) return 4;
      if (posicao <= 6) return 3;
      if (posicao <= 9) return 2;
      return 1;
    }

    data.forEach((v: any) => {
      if (!v.jogos) return;

      const pontos = calcularPontos(v.posicao);

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

  // 🔥 Dados para o gráfico
  const dadosGrafico = resultados.map((jogo) => ({
    nome: jogo.name,
    pontos: jogo.pontos,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Cabeçalho */}
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">
            Resultado da Semana
          </h1>
          <p className="text-slate-300 mt-2">
            Ranking geral baseado nas votações
          </p>
        </div>

        {/* Ranking */}
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

        {/* 📊 GRÁFICO */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold mb-6 text-slate-800">
            📊 Pontuação por Jogo
          </h2>

          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pontos" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
