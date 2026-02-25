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
      const res = await fetch("/api/contas"); // você deve já ter algo similar
      const data = await res.json();
      setContas(data);
    }
    fetchContas();
  }, []);

  function adicionarColocacao() {
    if (resultados.length < 4) {
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
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Registrar Partida</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input
          type="date"
          value={dataPartida}
          onChange={(e) => setDataPartida(e.target.value)}
          required
          className="bg-slate-800 p-2 rounded"
        />

        {resultados.map((r, index) => (
          <div key={index} className="bg-slate-800 p-4 rounded flex flex-col gap-2">
            <label>{r.colocacao}º Lugar</label>

            <select
              value={r.conta_id}
              onChange={(e) => {
                const newResultados = [...resultados];
                newResultados[index].conta_id = e.target.value;
                setResultados(newResultados);
              }}
              required
              className="bg-slate-700 p-2 rounded"
            >
              <option value="">Selecione</option>
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
              className="bg-slate-700 p-2 rounded"
            />
          </div>
        ))}

        {resultados.length < 4 && (
          <button
            type="button"
            onClick={adicionarColocacao}
            className="bg-blue-600 p-2 rounded"
          >
            + Adicionar Colocação
          </button>
        )}

        <button
          type="submit"
          className="bg-green-600 p-3 rounded font-bold"
        >
          Salvar Partida
        </button>
      </form>
    </div>
  );
}