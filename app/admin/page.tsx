"use client";

import { useState } from "react";

export const dynamic = "force-dynamic";

export default function Home() {
  const [texto, setTexto] = useState("");
  const [lista, setLista] = useState<string[]>([]);

  function inserir() {
    if (!texto.trim()) return;

    setLista([...lista, texto]);
    setTexto("");
  }

  return (
    <main className="container">
      <h1 className="titulo">Jogo da Semana</h1>

      <textarea
        className="textarea"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Digite o nome do jogo..."
      />

      <button className="botao" onClick={inserir}>
        Inserir
      </button>

      <ul className="lista">
        {lista.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </main>
  );
}
