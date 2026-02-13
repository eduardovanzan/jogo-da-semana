"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";
import styles from "../auth.module.css";

export default function CadastroPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Conta criada! Faça login.");
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={cadastrar}>
        <h1 className={styles.title}>Criar conta</h1>

        <input
          className={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className={styles.input}
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button className={styles.button} disabled={loading}>
          {loading ? "Criando..." : "Cadastrar"}
        </button>

        {msg && <div className={styles.msgSuccess}>{msg}</div>}

        <p className={styles.link} onClick={() => router.push("/login")}>
          Já tenho conta
        </p>
      </form>
    </div>
  );
}
