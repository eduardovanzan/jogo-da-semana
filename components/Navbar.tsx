"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          className="flex items-center gap-2 text-white font-bold text-lg hover:text-blue-400 transition-colors duration-200">
          <span className="text-xl">🎲</span>
          Jogo da Semana
        </Link>

        {/* Botão Mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-white text-2xl">
            ☰
          </button>

        <div className="hidden md:flex items-center gap-6 text-white font-medium">

          <Link href="/escolhas" className="hover:text-blue-400 transition-colors duration-200">
            Minhas Escolhas
          </Link>

          <Link href="/votar" className="hover:text-blue-400 transition-colors duration-200">
            Votação
          </Link>

          <Link href="/resultados" className="hover:text-blue-400 transition-colors duration-200">
            Resultado
          </Link>

          {/* Dropdown Historico */}
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
                  href="/historico/partidas"
                  className="block px-4 py-2 hover:bg-slate-700 transition-colors"
                >
                  Nova Partida
                </Link>

                <Link
                  href="/historico/partidas"
                  className="block px-4 py-2 hover:bg-slate-700 transition-colors"
                >
                  Ranking de Vitórias
                </Link>

              </div>
            </div>
          </div>

          {/* Dropdown Ranking */}
          <div className="relative group">
            <button className="hover:text-blue-400 transition-colors duration-200">
              Boardboxd ▾
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
                  href="/historico/partidas"
                  className="block px-4 py-2 hover:bg-slate-700 rounded-t-xl transition-colors"
                >
                  Pessoal
                </Link>

                <Link
                  href="/historico/partidas"
                  className="block px-4 py-2 hover:bg-slate-700 transition-colors"
                >
                  Geral
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

      {/* Menu Mobile */}
          <div
            className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 
              ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

            {/* Overlay Escuro */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu Lateral */}
            <div
              className={`
                absolute right-0 top-0 h-full w-64
                bg-slate-900 shadow-xl
                transform transition-transform duration-300
                ${mobileOpen ? "translate-x-0" : "translate-x-full"}
              `}
            >
              <div className="p-6 flex flex-col gap-4 text-white">

                <button
                  onClick={() => setMobileOpen(false)}
                  className="self-end text-2xl"
                >
                  ✕
                </button>

                <Link href="/escolhas" onClick={() => setMobileOpen(false)}>
                  Minhas Escolhas
                </Link>

                <Link href="/votar" onClick={() => setMobileOpen(false)}>
                  Votação
                </Link>

                <Link href="/resultados" onClick={() => setMobileOpen(false)}>
                  Resultado
                </Link>

                <Link href="/historico/alugados" onClick={() => setMobileOpen(false)}>
                  Histórico de Alugados
                </Link>

                <Link href="/historico/partidas" onClick={() => setMobileOpen(false)}>
                  Registrar Nova Partida
                </Link>

                <Link href="/historico/alugados" onClick={() => setMobileOpen(false)}>
                  Ranking de Vitórias
                </Link>

                <Link href="/historico/alugados" onClick={() => setMobileOpen(false)}>
                  Boardboxd Pessoal
                </Link>

                <Link href="/historico/alugados" onClick={() => setMobileOpen(false)}>
                  Boardboxd Geral
                </Link>

                <Link href="/admin" onClick={() => setMobileOpen(false)}>
                  Admin
                </Link>

                <hr className="border-slate-700 my-4" />

                {!user ? (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                    <Link href="/cadastro" onClick={() => setMobileOpen(false)}>
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
                      className="text-left text-red-400"
                    >
                      Sair
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
    </nav>
  );
}