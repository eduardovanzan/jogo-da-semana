"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";
import styles from "../auth.module.css";

export default function CadastroPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMsg("Let me cook...");

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      setMsg("❌ Deu merda" + error.message);
      return;
    }

    setMsg("✅ Deu bom!");
    setTimeout(() => router.push("/login"), 2000);
  }

    return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={cadastrar}>
        <h1>Criar Conta</h1>

        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit">Cadastrar</button>

        <p className="msg">{msg}</p>
      </form>
    </div>
  );
}

  
/*  return (
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
*/