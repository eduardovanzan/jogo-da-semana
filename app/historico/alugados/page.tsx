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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">Histórico de Alugados</h1>

        {/* Inserção */}
        <div className="bg-slate-800 p-6 rounded-xl space-y-4">
          <h2 className="font-semibold">Inserir novo aluguel</h2>

          <div className="flex gap-4">
            <select
              className="text-black p-2 rounded"
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
              className="text-black p-2 rounded"
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
              className="bg-green-600 px-4 py-2 rounded cursor-pointer hover:bg-green-700"
            >
              Inserir
            </button>
          </div>
        </div>

        {/* Filtro */}
        <div>
          <select
            className="text-black p-2 rounded"
            onChange={(e) => {
              setFiltroJogo(e.target.value);
              carregarAlugueis(e.target.value);
            }}
          >
            <option value="">Filtrar por jogo</option>
            {jogos.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lista */}
        <div className="bg-slate-800 p-6 rounded-xl space-y-4">
          {alugueis.map((a) => (
            <div
              key={a.id}
              className="bg-slate-700 p-4 rounded-lg flex justify-between"
            >
              <span>{a.jogos.name}</span>

              <span>
                Semana {a.semanas.numero} (
                {new Date(a.semanas.data_inicio).toLocaleDateString()} -{" "}
                {new Date(a.semanas.data_fim).toLocaleDateString()}
                )
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}