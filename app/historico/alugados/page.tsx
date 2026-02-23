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
  const [semanas, setSemanas] = useState<Semana[]>([]);
  const [jogosSemana, setJogosSemana] = useState<Jogo[]>([]);

  const [semanaSelecionada, setSemanaSelecionada] = useState("");
  const [jogoSelecionado, setJogoSelecionado] = useState("");

async function carregarAlugueis() {
  const res = await fetch("/api/historico/alugados");
  const data = await res.json();
  setAlugueis(data || []);
}

async function carregarSemanas() {
  const res = await fetch("/api/historico/alugados?semanas=true");
  const data = await res.json();
  setSemanas(data || []);
}

async function carregarJogosDaSemana(semanaId: string) {
  const res = await fetch(`/api/historico/alugados?semana=${semanaId}`);
  const data = await res.json();
  setJogosSemana(data || []);
}

async function inserir() {
  if (!semanaSelecionada || !jogoSelecionado) return;

  const res = await fetch("/api/historico/alugados", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jogo_id: Number(jogoSelecionado),
      semana_id: semanaSelecionada,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  setJogoSelecionado("");
  carregarAlugueis();
}

  useEffect(() => {
    carregarAlugueis();
    carregarSemanas();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-10">

        <h1 className="text-4xl font-bold">Histórico de Alugados</h1>

        {/* Inserção */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">

          <div className="space-y-2">
            <label className="text-sm text-slate-400">
              Inserir Semana
            </label>
            <select
              className="bg-slate-800 border border-slate-700 p-3 rounded-xl w-full"
              value={semanaSelecionada}
              onChange={(e) => {
                const id = e.target.value;
                setSemanaSelecionada(id);
                setJogosSemana([]);
                setJogoSelecionado("");
                if (id) carregarJogosDaSemana(id);
              }}
            >
              <option value="">Selecione a semana</option>
              {semanas.map((s) => (
                <option key={s.id} value={s.id}>
                  Semana {s.numero}
                </option>
              ))}
            </select>
          </div>

          {semanaSelecionada && (
            <div className="space-y-2">
              <label className="text-sm text-slate-400">
                Inserir Jogo
              </label>
              <select
                className="bg-slate-800 border border-slate-700 p-3 rounded-xl w-full"
                value={jogoSelecionado}
                onChange={(e) => setJogoSelecionado(e.target.value)}
              >
                <option value="">Selecione o jogo</option>
                {jogosSemana.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {semanaSelecionada && jogoSelecionado && (
            <button
              onClick={inserir}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl transition"
            >
              Inserir aluguel
            </button>
          )}

        </div>

            {/* Lista agrupada */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-8">
             {Object.entries(
                alugueis.reduce((acc, aluguel) => {
                    const numero = aluguel.semanas.numero;

                    if (!acc[numero]) {
                        acc[numero] = {
                            data_inicio: aluguel.semanas.data_inicio,
                            data_fim: aluguel.semanas.data_fim,
                            alugueis: [],
                        };
                    }

                    acc[numero].alugueis.push(aluguel);
                    return acc;
                }, {} as Record<
                    number,
                    {
                        data_inicio: string;
                        data_fim: string;
                        alugueis: Aluguel[];
                    }
                >)
            )
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([numero, semana]) => (
                    <div key={numero} className="space-y-3">
                        <h2 className="text-xl font-semibold border-b border-slate-700 pb-2 flex justify-between">
                            <span>Semana {numero}</span>
                            <span className="text-sm text-slate-400">
                                {new Date(semana.data_inicio).toLocaleDateString("pt-BR")} —{" "}
                                {new Date(semana.data_fim).toLocaleDateString("pt-BR")}
                            </span>
                        </h2>

                        {semana.alugueis.map((a) => (
                            <div
                                key={a.id}
                                className="bg-slate-800 p-4 rounded-xl flex justify-between"
                            >
                                <span>{a.jogos.name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}