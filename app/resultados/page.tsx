"use client";

import { useEffect, useState } from "react";
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
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [semana, setSemana] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarResultados() {
      try {
        const res = await fetch("/api/resultados");
        const data = await res.json();

        if (!res.ok) {
          setErro(data.error);
          return;
        }

        setSemana(data.semana);
        setResultados(data.resultados);
      } catch {
        setErro("Erro ao carregar resultados");
      } finally {
        setLoading(false);
      }
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

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-400">
        {erro}
      </div>
    );
  }

  const medalhas = ["🥇", "🥈", "🥉"];

  const dadosGrafico = resultados.map((jogo) => ({
    nome: jogo.name,
    pontos: jogo.pontos,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-10">

        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">
            Resultado da Semana {semana?.numero}
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