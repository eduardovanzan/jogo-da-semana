"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          Jogo da Semana ⚽
        </Link>

        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/escolhas">Escolhas</Link>
          <Link href="/votar">Votação</Link>
          <Link href="/resultados">Resultado</Link>

          {!user ? (
            <>
              <Link href="/login" className="btn-outline">
                Login
              </Link>
              <Link href="/cadastro" className="btn-primary">
                Cadastro
              </Link>
            </>
          ) : (
            <>
              <span className="user-email">
                👤 {user.email}
              </span>

              <button onClick={handleLogout} className="btn-danger">
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
