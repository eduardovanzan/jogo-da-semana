"use client";

import { useState } from "react";
import styles from "./globals.css";

export default function Home() {
  const [texto, setTexto] = useState("");
  const [lista, setLista] = useState<string[]>([]);

  function inserir() {
    const valor = texto.trim();

    if (!valor) {
      alert("Digite algo primeiro!");
      return;
    }

    setLista([...lista, valor]);
    setTexto("");
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.titulo}>Jogo da Semana</h1>

      <textarea
        className={styles.textarea}
        placeholder="Digite o nome do jogo..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button className={styles.botao} onClick={inserir}>
        Inserir
      </button>

      <ul className={styles.lista}>
        {lista.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </main>
  );
}
