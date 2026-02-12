"use client";

import { useState } from "react";
import styles from "./page.module.css";

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

  const usuario_id = "usuario-teste-1";

  // 🔥 busca no servidor
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

    await fetch("/api/escolhas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id,
        jogos: selecionados.map((j) => j.id),
      }),
    });

    setLoading(false);
    setMsg("✅ Salvo com sucesso!");
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Escolha 3 jogos</h1>

      {/* busca */}
      <input
        className={styles.input}
        placeholder="Digite para buscar..."
        value={query}
        onChange={(e) => buscar(e.target.value)}
      />

      {/* resultados */}
      {resultados.length > 0 && (
        <div className={styles.dropdown}>
          {resultados.map((jogo) => (
            <div
              key={jogo.id}
              className={styles.option}
              onClick={() => adicionar(jogo)}
            >
              {jogo.name}
            </div>
          ))}
        </div>
      )}

      {/* selecionados */}
      <div className={styles.selecionados}>
        {selecionados.map((jogo) => (
          <span key={jogo.id} className={styles.tag}>
            {jogo.name}
            <button onClick={() => remover(jogo.id)}>✕</button>
          </span>
        ))}
      </div>

      <button
        onClick={salvar}
        disabled={loading}
        className={styles.saveBtn}
      >
        {loading ? "Salvando..." : "Salvar escolhas"}
      </button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
