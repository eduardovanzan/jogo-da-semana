"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

type Semana = {
  id: string;
  numero: number;
  ativa: boolean;
};

export default function AdminPage() {
  const [semanas, setSemanas] = useState<Semana[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const supabase = getSupabaseClient();

  async function carregarSemanas() {
    const { data } = await supabase
      .from("semanas")
      .select("*")
      .order("numero", { ascending: false });

    if (data) setSemanas(data);
  }

  async function encerrarSemana(id: string) {
    setLoading(true);
    setMsg("");

    await supabase
      .from("semanas")
      .update({ ativa: false, data_fim: new Date() })
      .eq("id", id);

    setMsg("Semana encerrada com sucesso!");
    await carregarSemanas();
    setLoading(false);
  }

  async function iniciarNovaSemana() {
    setLoading(true);
    setMsg("");

    // 🔴 Primeiro encerra qualquer semana ativa
    await supabase
      .from("semanas")
      .update({ ativa: false })
      .eq("ativa", true);

    // 🔢 Descobre último número
    const { data } = await supabase
      .from("semanas")
      .select("numero")
      .order("numero", { ascending: false })
      .limit(1);

    const novoNumero = data && data.length > 0 ? data[0].numero + 1 : 1;

    // 🟢 Cria nova ativa
    await supabase.from("semanas").insert({
      numero: novoNumero,
      ativa: true,
      data_inicio: new Date(),
    });

    setMsg("Nova semana iniciada!");
    await carregarSemanas();
    setLoading(false);
  }

  useEffect(() => {
    carregarSemanas();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl space-y-6">

        <h1 className="text-2xl font-bold text-center">
          ⚙️ Painel Administrativo
        </h1>

        <button
          onClick={iniciarNovaSemana}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          ➕ Iniciar Nova Semana
        </button>

        <div className="space-y-3">
          {semanas.map((semana) => (
            <div
              key={semana.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  Semana {semana.numero}
                </p>
                <p className="text-sm text-gray-500">
                  {semana.ativa ? "🟢 Ativa" : "🔴 Encerrada"}
                </p>
              </div>

              {semana.ativa && (
                <button
                  onClick={() => encerrarSemana(semana.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                >
                  Encerrar
                </button>
              )}
            </div>
          ))}
        </div>

        {msg && (
          <p className="text-center text-sm text-gray-600">
            {msg}
          </p>
        )}

      </div>
    </div>
  );
}