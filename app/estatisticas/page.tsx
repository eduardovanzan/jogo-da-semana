"use client";

import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const TABS = [
  { key: "tempo", label: "Horas Jogadas" },
  { key: "partidas", label: "Partidas Jogadas" }
];

export default function Estatisticas() {

  const [tipo, setTipo] = useState("tempo");
  const [lista, setLista] = useState<any[]>([]);
  const [grafico, setGrafico] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, [tipo, page]);

  async function carregar() {

    setLoading(true);

    const res = await fetch(`/api/estatisticas?tipo=${tipo}&page=${page}`);
    const data = await res.json();

    setLista(data.lista || []);
    setGrafico(data.grafico || []);
    setTotal(data.total || 0);

    setLoading(false);
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-12">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Estatísticas dos Jogos
        </h1>

        {/* TABS */}
        <div className="flex gap-3 mb-8">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => {
                setTipo(t.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                tipo === t.key
                  ? "bg-blue-600"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-10">

          {/* LISTA */}
          <div>

            <h2 className="mb-4 text-lg font-semibold">
              Ranking
            </h2>

            {loading ? (
              <div>Carregando...</div>
            ) : (
              <div className="flex flex-col gap-3">

                {lista.map((j, i) => (
                  <div
                    key={j.id}
                    className="flex justify-between bg-slate-800 p-4 rounded-lg border border-slate-700"
                  >
                    <span>
                      {((page - 1) * 10) + i + 1}. {j.nome}
                    </span>

                    <span className="text-blue-400 font-semibold">
                      {tipo === "tempo"
                        ? `${j.valor.toFixed(1)}h`
                        : j.valor}
                    </span>
                  </div>
                ))}

              </div>
            )}

            {/* PAGINAÇÃO */}
            <div className="flex gap-2 mt-6">

              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40"
              >
                ←
              </button>

              <span className="px-3 py-1">
                {page} / {totalPages || 1}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40"
              >
                →
              </button>

            </div>

          </div>

          {/* GRÁFICO */}
          <div>

            <h2 className="mb-4 text-lg font-semibold">
              Distribuição
            </h2>

            <div className="h-[300px] bg-slate-800 rounded-xl p-4">

              <ResponsiveContainer width="100%" height="100%">

                <PieChart>

                  <Pie
                    data={grafico}
                    dataKey="valor"
                    nameKey="nome"
                    outerRadius={100}
                    label
                  >
                    {grafico.map((_, i) => (
                      <Cell key={i} />
                    ))}
                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}