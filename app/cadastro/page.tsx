"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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
      setMsg("❌ " + error.message);
      return;
    }

    setMsg("✅ Conta criada! Verifique seu email.");
    router.push("/login");
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h1>Cadastro</h1>

      <form onSubmit={cadastrar}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Criando..." : "Cadastrar"}
        </button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
