"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);

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
        ${
          scrolled
            ? "shadow-lg bg-slate-900/95 backdrop-blur-md"
            : "bg-slate-900"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link
          href="/"
          className="flex items-center gap-2 text-white font-bold text-lg hover:text-blue-400 transition-colors duration-200"
        >
          <span className="text-xl">🎲</span>
          Jogo da Semana
        </Link>

        <div className="flex items-center gap-6 text-white font-medium">

          <Link href="/escolhas" className="hover:text-blue-400 transition-colors duration-200">
            Minhas Escolhas
          </Link>

          <Link href="/votar" className="hover:text-blue-400 transition-colors duration-200">
            Votação
          </Link>

          <Link href="/resultados" className="hover:text-blue-400 transition-colors duration-200">
            Resultado
          </Link>

          {/* 🔥 DROPDOWN HISTÓRICO */}
          <div className="relative group">
            <button className="hover:text-blue-400 transition-colors duration-200">
              Histórico ▾
            </button>

            <div
              className="
                absolute right-0 top-full pt-3
                w-48
                opacity-0 translate-y-2
                group-hover:opacity-100
                group-hover:translate-y-0
                pointer-events-none
                group-hover:pointer-events-auto
                transition-all duration-200
              "
            >
              <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
                <Link
                  href="/historico/alugados"
                  className="block px-4 py-2 hover:bg-slate-700 rounded-t-xl transition-colors"
                >
                  Alugados
                </Link>

                <Link
                  href="/historico/votos"
                  className="block px-4 py-2 hover:bg-slate-700 transition-colors"
                >
                  Votos
                </Link>

                <Link
                  href="/historico/semanas"
                  className="block px-4 py-2 hover:bg-slate-700 rounded-b-xl transition-colors"
                >
                  Semanas
                </Link>
              </div>
            </div>
          </div>

          <Link href="/admin" className="hover:text-blue-400 transition-colors duration-200">
            Admin
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
                className="cursor-pointer px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}