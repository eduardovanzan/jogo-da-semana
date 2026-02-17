"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
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

    // 👇 detecta scroll para adicionar sombra
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
  <nav
    className={`
      sticky top-0 z-50
      transition-all duration-300
      ${scrolled
        ? "shadow-lg bg-slate-900/95 backdrop-blur-md"
        : "bg-slate-900"}
    `}
  >
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

      <Link
        href="/"
        className="text-white font-bold text-lg hover:text-blue-400 transition-colors duration-200"
      >
        Jogo da Semana ⚽
      </Link>

      <div className="flex items-center gap-6 text-white font-medium">

        <Link href="/" className="hover:text-blue-400 transition-colors duration-200">
          Home
        </Link>

        <Link href="/escolhas" className="hover:text-blue-400 transition-colors duration-200">
          Escolhas
        </Link>

        <Link href="/votar" className="hover:text-blue-400 transition-colors duration-200">
          Votação
        </Link>

        <Link href="/resultados" className="hover:text-blue-400 transition-colors duration-200">
          Resultado
        </Link>

        {!user ? (
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg border border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-200"
            >
              Login
            </Link>

            <Link
              href="/cadastro"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Cadastro
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm text-slate-300">
              👤 {user.email}
            </span>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200"
            >
              Sair
            </button>
          </>
        )}
      </div>
    </div>
  </nav>
)}
