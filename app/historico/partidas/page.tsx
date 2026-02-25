"use client";

import { useEffect, useState } from "react";

export default function NovaPartida() {
  const [contas, setContas] = useState<any[]>([]);
  const [jogos, setJogos] = useState<any[]>([]);
  const [dataPartida, setDataPartida] = useState("");
  const [jogoId, setJogoId] = useState("");
  const [resultados, setResultados] = useState([
    { colocacao: 1, conta_id: "", pontuacao: "" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDados() {
      try {
        const res = await fetch("/api/partidas");
        if (!res.ok) return;

        const data = await res.json();
        if (data?.contas) setContas(data.contas);
        if (data?.jogos) setJogos(data.jogos);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    }

    fetchDados();
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

    if (!jogoId) {
      alert("Selecione um jogo!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data_partida: dataPartida,
          jogo_id: jogoId,
          resultados,
        }),
      });

      if (!res.ok) {
        const erro = await res.text();
        console.error("Erro:", erro);
        alert("Erro ao registrar partida.");
        return;
      }

      alert("Partida registrada com sucesso!");

      // Resetar formulário
      setDataPartida("");
      setJogoId("");
      setResultados([{ colocacao: 1, conta_id: "", pontuacao: "" }]);

    } catch (err) {
      console.error("Erro:", err);
      alert("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-3xl mx-auto backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold mb-8 text-center">
          Registrar Nova Partida
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Jogo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Jogo</label>
            <select
              value={jogoId}
              onChange={(e) => setJogoId(e.target.value)}
              required
              className="cursor-pointer bg-slate-800/70 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition p-3 rounded-lg outline-none"
            >
              <option value="">Selecione o jogo</option>
              {jogos.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>

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
                  className="cursor-pointer bg-slate-700/80 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition p-3 rounded-lg outline-none"
                >
                  <option value="">Selecione o jogador</option>
                  {contas.map((c) => (
                    <option key={c.user_id} value={c.user_id}>
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
              className="cursor-pointer bg-blue-600 hover:bg-blue-500 transition p-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30"
            >
              + Adicionar Colocação
            </button>
          )}

          {/* Botão salvar */}
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer bg-green-600 hover:bg-green-500 transition p-4 rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Partida"}
          </button>
        </form>
      </div>
    </div>
  );
}