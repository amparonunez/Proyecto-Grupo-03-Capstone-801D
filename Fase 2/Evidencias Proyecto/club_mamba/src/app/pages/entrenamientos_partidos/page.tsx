"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { Calendar, MapPin, Clock, Dumbbell, Trophy } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function EntrenamientosPage() {
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [rol, setRol] = useState(null);

  const eventos = [
    {
      tipo: "Entrenamiento",
      fecha: "Lunes 14 de Octubre, 18:00",
      ubicacion: "Gimnasio Central",
      descripcion:
        "Sesión de técnica y resistencia enfocada en defensa y pases.",
      icono: <Dumbbell className="w-8 h-8 text-yellow-400" />,
    },
    {
      tipo: "Partido",
      fecha: "Viernes 18 de Octubre, 20:00",
      ubicacion: "Cancha Local - Club Andes",
      descripcion:
        "Partido amistoso contra el Club Andes. Se requiere puntualidad.",
      icono: <Trophy className="w-8 h-8 text-yellow-400" />,
    },
    {
      tipo: "Entrenamiento",
      fecha: "Miércoles 23 de Octubre, 19:30",
      ubicacion: "Gimnasio Norte",
      descripcion: "Entrenamiento táctico y revisión de jugadas defensivas.",
      icono: <Dumbbell className="w-8 h-8 text-yellow-400" />,
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      <main className="flex flex-col items-center py-16 flex-grow">
        <h1 className="text-5xl font-bold text-center mb-12 text-white">
          ENTRENAMIENTOS Y PARTIDOS
        </h1>

        <section className="w-[1000px] bg-[#181818] rounded-2xl shadow-2xl p-10 border border-gray-800">
          <div className="grid grid-cols-2 gap-8">
            {eventos.map((evento, index) => (
              <div
                key={index}
                onClick={() => setEventoSeleccionado(evento)}
                className="bg-[#1E1E1E] p-6 rounded-2xl border border-gray-700 hover:border-yellow-400 transition-all cursor-pointer hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-3">
                  {evento.icono}
                  <h2 className="text-2xl font-semibold text-yellow-400">
                    {evento.tipo}
                  </h2>
                </div>
                <p className="text-gray-300 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" /> {evento.fecha}
                </p>
                <p className="text-gray-400 text-sm">{evento.ubicacion}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="flex justify-center mt-10">
          {rol === "entrenador" && (
            <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-yellow-400 transition">
              <Link href="/pages/crear_partido_entrenamiento">
                Agregar evento
              </Link>
            </button>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal */}
      {eventoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-50 animate-fadeIn"
          onClick={() => setEventoSeleccionado(null)}
        >
          <div
            className="bg-[#1E1E1E] p-8 rounded-2xl shadow-xl border border-yellow-400 w-[400px] text-center animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              {eventoSeleccionado.icono}
            </div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">
              {eventoSeleccionado.tipo}
            </h2>
            <p className="text-gray-300 flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-4 h-4" /> {eventoSeleccionado.fecha}
            </p>
            <p className="text-gray-300 flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-4 h-4" /> {eventoSeleccionado.ubicacion}
            </p>
            <p className="text-gray-400 mb-6">
              {eventoSeleccionado.descripcion}
            </p>

            <button
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg shadow-md transition"
              onClick={() => alert("Te has inscrito en este evento.")}
            >
              Inscribirse
            </button>
          </div>
        </div>
      )}

      {/* Animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
