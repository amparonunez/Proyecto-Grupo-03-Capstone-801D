"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AsistenciaPage() {
  const [rol, setRol] = useState(null);
  const eventos = [
    {
      tipo: "Entrenamiento",
      fecha: "Lunes 14 de Octubre, 18:00",
      descripcion: "Sesión de técnica y resistencia en el gimnasio central.",
    },
    {
      tipo: "Partido",
      fecha: "Viernes 18 de Octubre, 20:00",
      descripcion: "Partido amistoso contra el Club Andes en cancha local.",
    },
    {
      tipo: "Entrenamiento",
      fecha: "Miércoles 23 de Octubre, 19:30",
      descripcion: "Entrenamiento táctico y revisión de jugadas.",
    },
  ];
  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("No hay usuario logueado");
        return;
      }

      const res = await fetch("/api/usuarios/rol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const result = await res.json();

      if (res.ok && result.rol) {
        setRol(result.rol);
      } else {
        console.error(result.error);
      }
    };

    fetchUserRole();
  }, []);
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Nav />
      <main className="min-h-screen bg-[black] text-white flex flex-col items-center py-16">
        <h1 className="text-5xl font-bold text-center mb-12 text-white">
          ASISTENCIA
        </h1>
        <section className="w-[1000px] bg-[#181818] rounded-2xl shadow-2xl p-10 border border-gray-800">
          <div className="grid grid-cols-2 gap-8">
            {eventos.map((evento, index) => (
              <div
                key={index}
                className="bg-[#1E1E1E] p-6 rounded-2xl border border-gray-700 hover:border-yellow-400 transition-colors"
              >
                <h2 className="text-2xl font-semibold mb-2 text-yellow-400">
                  {evento.tipo}
                </h2>
                <p className="text-gray-300 mb-1">{evento.fecha}</p>
                <p className="text-gray-400 text-sm mb-6">
                  {evento.descripcion}
                </p>

                <div className="flex justify-between">
                  {rol === "entrenador" && (
                    <Link href="/pages/registrar_asistencia">
                      <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-5 rounded-lg shadow-md transition">
                        Registrar Asistencia
                      </button>
                    </Link>
                  )}
                  <Link href={"/pages/visualizar_asistencia"}>
                    <button className="bg-transparent border border-yellow-500 hover:bg-yellow-500 hover:text-black font-semibold py-2 px-5 rounded-lg transition">
                      Visualizar Asistencia
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}
