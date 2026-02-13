"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMsg("");

    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={login}>
        <h1 className={styles.title}>Entrar na conta</h1>

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
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {msg && <div className={styles.msgError}>{msg}</div>}

        <p className={styles.link} onClick={() => router.push("/cadastro")}>
          Criar conta
        </p>
      </form>
    </div>
  );
}
