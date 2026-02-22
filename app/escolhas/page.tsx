"use client";

import { useState, useEffect } from "react";

type Jogo = {
  id: number;
  name: string;
  rank?: number;
  is_expansion: boolean;
};

export default function EscolhasPage() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Jogo[]>([]);
  const [selecionados, setSelecionados] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [escolhasAnteriores, setEscolhasAnteriores] = useState<any[]>([]);
  const [escolhasUsuarios, setEscolhasUsuarios] = useState<any[]>([]);
  const [semanaAtiva, setSemanaAtiva] = useState<any>(null);

  // 🔥 Agora busca tudo pelo backend
  async function carregarEscolhas() {
    setMsg("");

    try {
      const res = await fetch("/api/escolhas");

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Erro ao carregar dados");
        return;
      }

      setSemanaAtiva(data.semana);
      setEscolhasAnteriores(data.minhasEscolhas);
      setEscolhasUsuarios(data.escolhasUsuarios);
    } catch (err) {
      setMsg("Erro ao conectar com servidor");
    }
  }

  useEffect(() => {
    carregarEscolhas();
  }, []);

  async function buscar(valor: string) {
    setQuery(valor);

    if (valor.length < 2) {
      setResultados([]);
      return;
    }

    const res = await fetch(`/api/jogos?q=${valor}`);
    const data = await res.json();
    setResultados(data);
  }

  function adicionar(jogo: Jogo) {
    if (selecionados.find((j) => j.id === jogo.id)) return;

    if (selecionados.length >= 3) {
      alert("Máximo 3 jogos");
      return;
    }

    setSelecionados([...selecionados, jogo]);
    setQuery("");
    setResultados([]);
  }

  function remover(id: number) {
    setSelecionados(selecionados.filter((j) => j.id !== id));
  }

  async function salvar() {
    if (selecionados.length !== 3) {
      alert("Escolha exatamente 3 jogos");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/escolhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jogos: selecionados.map((j) => j.id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(`❌ ${data.error || "Erro desconhecido"}`);
        return;
      }

      setMsg("✅ Salvo com sucesso!");
      setSelecionados([]);
      await carregarEscolhas(); // 🔥 recarrega tudo
    } catch (err) {
      setMsg("❌ Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 space-y-6">

        <h1 className="text-2xl font-bold text-gray-800 text-center">
          🎮 Semana {semanaAtiva?.numero || "-"} - Escolhe 3 Jogos Na Moral
        </h1>

        {/* Campo de busca */}
        <div className="relative">
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Digite para buscar..."
            value={query}
            onChange={(e) => buscar(e.target.value)}
          />

          {resultados.length > 0 && (
            <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {resultados.map((jogo) => (
                <div
                  key={jogo.id}
                  onClick={() => adicionar(jogo)}
                  className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {jogo.name}
                    </span>

                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                      {jogo.is_expansion ? "Expansão" : `Rank #${jogo.rank}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selecionados */}
        <div className="flex flex-wrap gap-2">
          {selecionados.map((jogo) => (
            <span
              key={jogo.id}
              className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
            >
              {jogo.name}
              <button
                onClick={() => remover(jogo.id)}
                className="text-indigo-500 hover:text-red-500 transition"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Botão */}
        <button
          onClick={salvar}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-md
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }
          `}
        >
          {loading ? "Salvando..." : "Salvar escolhas"}
        </button>

        {msg && (
          <p className="text-center text-sm font-medium text-gray-600">
            {msg}
          </p>
        )}

        {/* Suas escolhas */}
        {escolhasAnteriores.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Sua escolha da semana
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {escolhasAnteriores.map((jogo) => (
                <div
                  key={jogo.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-gray-700"
                >
                  {jogo.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Escolhas dos outros */}
        {escolhasUsuarios.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              👥 Escolhas da board gang
            </h2>

            <div className="space-y-4">
              {escolhasUsuarios.map((usuario, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <p className="font-semibold text-indigo-600 mb-2">
                    {usuario.nome}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {usuario.jogos.map((jogo: any) => (
                      <span
                        key={jogo.id}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {jogo.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}