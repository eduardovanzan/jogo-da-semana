"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

type Jogo = {
  id: number;
  name: string;
};

export default function EscolhasPage() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Jogo[]>([]);
  const [selecionados, setSelecionados] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [escolhasAnteriores, setEscolhasAnteriores] = useState<any[]>([]);

  useEffect(() => {
  async function carregarEscolhas() {
    const supabase = getSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("escolhas_semana")
      .select("jogos(id, name)")
      .eq("user_id", user.id);

    if (!data) return;

    const jogos = data
      .map((e: any) => e.jogos)
      .filter(Boolean);

    setEscolhasAnteriores(jogos);
  }

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
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMsg("❌ Você precisa fazer login primeiro");
        return;
      }

      const res = await fetch("/api/escolhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: user.id,
          jogos: selecionados.map((j) => j.id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(`❌ ${data.error || "Erro desconhecido"}`);
        return;
      }

      setMsg("✅ Salvo com sucesso!");
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
        🎮 Escolha 3 Jogos
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
          <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {resultados.map((jogo) => (
              <div
                key={jogo.id}
                onClick={() => adicionar(jogo)}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition"
              >
                {jogo.name}
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
            className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
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
        className={`w-full py-3 rounded-lg font-semibold text-white transition
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }
        `}
      >
        {loading ? "Salvando..." : "Salvar escolhas"}
      </button>

      {/* Mensagem */}
      {msg && (
        <p className="text-center text-sm font-medium text-gray-600">
          {msg}
        </p>
      )}

      {/* 🔽 Escolhas Anteriores (AGORA DENTRO DA DIV BRANCA) */}
      {escolhasAnteriores.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🏆 Suas escolhas anteriores
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {escolhasAnteriores.map((jogo) => (
              <div
                key={jogo.id}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm hover:shadow-md transition"
              >
                {jogo.name}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  </div>
);
}
