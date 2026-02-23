"use client";

import { useEffect, useState } from "react";

type Aluguel = {
  id: string;
  jogos: { id: number; name: string };
  semanas: {
    id: string;
    numero: number;
    data_inicio: string;
    data_fim: string;
  };
};

type Jogo = {
  id: number;
  name: string;
};

type Semana = {
  id: string;
  numero: number;
};

export default function AlugadosPage() {
  const [alugueis, setAlugueis] = useState<Aluguel[]>([]);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [semanas, setSemanas] = useState<Semana[]>([]);
  const [jogoSelecionado, setJogoSelecionado] = useState("");
  const [semanaSelecionada, setSemanaSelecionada] = useState("");
  const [filtroJogo, setFiltroJogo] = useState("");

  async function carregarAlugueis(jogo?: string) {
    const res = await fetch(
      jogo ? `/api/historico/alugados?jogo=${jogo}` : "/api/historico/alugados"
    );
    const data = await res.json();
    setAlugueis(data.alugueis || []);
  }

  async function carregarDadosAuxiliares() {
    const [resJogos, resSemanas] = await Promise.all([
      fetch("/api/jogos"),
      fetch("/api/semanas"),
    ]);

    const dataJogos = await resJogos.json();
    const dataSemanas = await resSemanas.json();

    setJogos(dataJogos);
    setSemanas(dataSemanas);
  }

  async function inserir() {
    await fetch("/api/historico/alugados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jogo_id: Number(jogoSelecionado),
        semana_id: semanaSelecionada,
      }),
    });

    carregarAlugueis();
  }

  useEffect(() => {
    carregarAlugueis();
    carregarDadosAuxiliares();
  }, []);

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
    <div className="max-w-5xl mx-auto space-y-10">

      {/* Título */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Histórico de Alugados
        </h1>
        <p className="text-slate-400 text-sm">
          Gerencie e consulte os jogos alugados por semana
        </p>
      </div>

      {/* Inserção */}
      <div className="bg-slate-900/70 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-lg font-semibold text-slate-200">
          Inserir novo aluguel
        </h2>

        <div className="flex flex-col md:flex-row gap-4">

          <select
            className="bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            onChange={(e) => setJogoSelecionado(e.target.value)}
          >
            <option value="">Selecione o jogo</option>
            {jogos.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>

          <select
            className="bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            onChange={(e) => setSemanaSelecionada(e.target.value)}
          >
            <option value="">Selecione a semana</option>
            {semanas.map((s) => (
              <option key={s.id} value={s.id}>
                Semana {s.numero}
              </option>
            ))}
          </select>

          <button
            onClick={inserir}
            className="bg-green-600 hover:bg-green-700 transition-all px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-green-900/40 cursor-pointer"
          >
            Inserir
          </button>

        </div>
      </div>

      {/* Filtro */}
      <div className="bg-slate-900/70 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">
          Filtrar
        </h2>

        <select
          className="bg-slate-800 border border-slate-700 text-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition w-full md:w-1/2"
          onChange={(e) => {
            setFiltroJogo(e.target.value);
            carregarAlugueis(e.target.value);
          }}
        >
          <option value="">Todos os jogos</option>
          {jogos.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <div className="bg-slate-900/70 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">

        {alugueis.length === 0 && (
          <p className="text-slate-400 text-sm">
            Nenhum aluguel registrado.
          </p>
        )}

        {alugueis.map((a) => (
          <div
            key={a.id}
            className="bg-slate-800 border border-slate-700 hover:border-green-600/40 transition-all p-5 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center gap-2"
          >
            <div className="font-medium text-slate-100">
              {a.jogos.name}
            </div>

            <div className="text-sm text-slate-400">
              Semana {a.semanas.numero} •{" "}
              {new Date(a.semanas.data_inicio).toLocaleDateString()} —{" "}
              {new Date(a.semanas.data_fim).toLocaleDateString()}
            </div>
          </div>
        ))}

      </div>

    </div>
  </div>
);
}