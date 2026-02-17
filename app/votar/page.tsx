"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

type Jogo = {
  id: number;
  nome: string;
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
        .select("jogo_id, jogos(id, nome)");

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

    const res = await fetch("/api/votos", {
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
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Votação da Semana</h1>

      {erro && (
        <p style={{ color: "red", marginBottom: 10 }}>
          {erro}
        </p>
      )}

      {ranking.map((valor, index) => (
        <div key={index} style={{ marginBottom: 15 }}>
          <label>
            {index + 1}º lugar:
          </label>
          <br />
          <select
            value={valor}
            onChange={(e) =>
              atualizarRanking(index, e.target.value)
            }
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">Selecione um jogo</option>
            {jogos.map((jogo) => (
              <option key={jogo.id} value={jogo.id}>
                {jogo.nome}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={enviarVotacao}
        style={{
          padding: 10,
          width: "100%",
          cursor: "pointer",
        }}
      >
        Enviar Ranking
      </button>
    </div>
  );
}
