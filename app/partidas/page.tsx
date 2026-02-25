"use client";

import { useEffect, useState } from "react";

export default function NovaPartida() {
  const [contas, setContas] = useState<any[]>([]);
  const [dataPartida, setDataPartida] = useState("");
  const [resultados, setResultados] = useState([
    { colocacao: 1, conta_id: "", pontuacao: "" },
  ]);

  useEffect(() => {
    async function fetchContas() {
      try {
        const res = await fetch("/api/partidas");
        if (!res.ok) return;

        const data = await res.json();
        setContas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro:", err);
      }
    }

    fetchContas();
  }, []);

  function adicionarColocacao() {
    if (resultados.length < 6) {
      setResultados([
        ...resultados,
        {
          colocacao: resultados.length + 1,
          conta_id: "",
          pontuacao: "",
        },
      ]);
    }
  }

  function removerColocacao(index: number) {
    const novos = resultados.filter((_, i) => i !== index);
    const reajustado = novos.map((r, i) => ({
      ...r,
      colocacao: i + 1,
    }));
    setResultados(reajustado);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    await fetch("/api/partidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data_partida: dataPartida,
        resultados,
      }),
    });

    alert("Partida registrada!");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold mb-8 text-center">
          Registrar Nova Partida
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Data */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Data da Partida</label>
            <input
              type="date"
              value={dataPartida}
              onChange={(e) => setDataPartida(e.target.value)}
              required
              className="bg-slate-800/70 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition p-3 rounded-lg outline-none"
            />
          </div>

          {/* Colocações */}
          <div className="flex flex-col gap-6">
            {resultados.map((r, index) => (
              <div
                key={index}
                className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 flex flex-col gap-4 transition hover:border-blue-500/40"
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    {r.colocacao}º Lugar
                  </span>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removerColocacao(index)}
                      className="text-red-400 text-sm hover:text-red-300 transition"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <select
                  value={r.conta_id}
                  onChange={(e) => {
                    const newResultados = [...resultados];
                    newResultados[index].conta_id = e.target.value;
                    setResultados(newResultados);
                  }}
                  required
                  className="bg-slate-700/80 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition p-3 rounded-lg outline-none"
                >
                  <option value="">Selecione o jogador</option>
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Pontuação (opcional)"
                  value={r.pontuacao}
                  onChange={(e) => {
                    const newResultados = [...resultados];
                    newResultados[index].pontuacao = e.target.value;
                    setResultados(newResultados);
                  }}
                  className="bg-slate-700/80 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition p-3 rounded-lg outline-none"
                />
              </div>
            ))}
          </div>

          {/* Botão adicionar */}
          {resultados.length < 6 && (
            <button
              type="button"
              onClick={adicionarColocacao}
              className="bg-blue-600 hover:bg-blue-500 transition p-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30"
            >
              + Adicionar Colocação
            </button>
          )}

          {/* Botão salvar */}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 transition p-4 rounded-xl font-bold text-lg shadow-lg shadow-green-600/30"
          >
            Salvar Partida
          </button>
        </form>
      </div>
    </div>
  );
}