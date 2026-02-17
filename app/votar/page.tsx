"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

type Jogo = {
  id: number;
  name: string;
};

export default function VotarPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const router = useRouter();

  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [ranking, setRanking] = useState<(number | "")[]>(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarJogos() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Busca jogos escolhidos na semana
      const { data, error } = await supabase
        .from("escolhas_semana")
        .select("jogo_id, jogos(id, name)");

      if (error) {
        setErro(error.message);
      } else {
        const jogosFormatados =
          data?.map((item: any) => item.jogos) ?? [];
        setJogos(jogosFormatados);
      }

      setLoading(false);
    }

    carregarJogos();
  }, []);

  function atualizarRanking(posicao: number, valor: string) {
    const novoRanking = [...ranking];
    novoRanking[posicao] = valor === "" ? "" : Number(valor);
    setRanking(novoRanking);
  }

  async function enviarVotacao() {
    setErro(null);

    // Verifica se todos campos foram preenchidos
    if (ranking.includes("")) {
      setErro("Preencha todas as posições do ranking.");
      return;
    }

    // Verifica duplicados
    const unicos = new Set(ranking);
    if (unicos.size !== ranking.length) {
      setErro("Não é permitido repetir jogos no ranking.");
      return;
    }

    const res = await fetch("/api/votar", {
      method: "POST",
      body: JSON.stringify({ ranking }),
    });

    const resultado = await res.json();

    if (!res.ok) {
      setErro(resultado.error);
      return;
    }

    alert("Votação enviada com sucesso!");
    router.refresh();
  }

  if (loading) return <p>Carregando...</p>;

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Votação da Semana
        </h1>
        <p className="text-slate-500 mt-2">
          Organize os jogos por ordem de preferência
        </p>
      </div>

      {erro && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
          {erro}
        </div>
      )}

      <div className="space-y-4">
        {ranking.map((valor, index) => {
          const medalhas = ["🥇", "🥈", "🥉"];
          return (
            <div key={index} className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700">
                {medalhas[index] || `${index + 1}º`} Lugar
              </label>

              <select
                value={valor}
                onChange={(e) =>
                  atualizarRanking(index, e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 transition"
              >
                <option value="">Selecione um jogo</option>
                {jogos.map((jogo) => (
                  <option key={jogo.id} value={jogo.id}>
                    {jogo.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <button
        onClick={enviarVotacao}
        className="w-full bg-blue-600 hover:bg-blue-700 
                   text-white font-semibold py-3 rounded-xl 
                   transition duration-200 shadow-md hover:shadow-lg"
      >
        Enviar Ranking
      </button>
    </div>
  </div>
)}