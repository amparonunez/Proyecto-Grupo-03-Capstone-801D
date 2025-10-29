"use client";

import { useState } from "react";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import {
  CalendarDays,
  Clock,
  MapPin,
  Dumbbell,
  Trophy,
  CheckCircle,
  FileText,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

export default function CrearEventoPage() {
  const [formData, setFormData] = useState({
    tipo: "",
    fecha: "",
    hora: "",
    lugar: "",
    descripcion: "", // 🆕 nuevo campo
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ahora también validamos descripción
    if (
      !formData.tipo ||
      !formData.fecha ||
      !formData.hora ||
      !formData.lugar ||
      !formData.descripcion
    ) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      const entrenador_id = user?.id;
      if (userError || !user) {
        alert("No hay usuario logueado. Inicia sesión.");
        return;
      }

      const res = await fetch("/api/eventos/agregar_evento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, entrenador_id }),
      });

      const data = await res.json();

      console.log("Respuesta API eventos:", res.status, data);

      if (!res.ok) {
        const msg = data?.error || data?.message || "Error al crear evento";
        alert(`❌ ${msg}`);
        return;
      }

      alert(`✅ ${formData.tipo} agregado correctamente!`);
      setFormData({
        tipo: "",
        fecha: "",
        hora: "",
        lugar: "",
        descripcion: "",
      });
    } catch (err) {
      console.error("Fetch error:", err);
      alert("❌ Error de red o interno. Revisa la consola y logs del servidor.");
    }
  };

  return (
    <AuthGuard allowedRoles={["entrenador"]}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Nav />

        <main className="flex-grow flex flex-col items-center py-16 px-6">
          <h1 className="text-5xl font-extrabold text-white mb-12 text-center">
            CREAR EVENTO
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-[#181818] w-full max-w-2xl p-10 rounded-2xl shadow-2xl border border-gray-800 animate-fadeIn"
          >
            {/* Tipo */}
            <label className="block mb-8">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                {formData.tipo === "Partido" ? (
                  <Trophy className="w-5 h-5" />
                ) : (
                  <Dumbbell className="w-5 h-5" />
                )}
                <span>Tipo de Evento</span>
              </div>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white focus:outline-none focus:border-yellow-400 transition"
              >
                <option value="">Seleccionar...</option>
                <option value="Entrenamiento">Entrenamiento</option>
                <option value="Partido">Partido</option>
              </select>
            </label>

            {/* Fecha */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <CalendarDays className="w-5 h-5" />
                <span>Fecha</span>
              </div>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white focus:outline-none focus:border-yellow-400 transition"
              />
            </label>

            {/* Hora */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <Clock className="w-5 h-5" />
                <span>Hora</span>
              </div>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white focus:outline-none focus:border-yellow-400 transition"
              />
            </label>

            {/* Lugar */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <MapPin className="w-5 h-5" />
                <span>Lugar</span>
              </div>
              <input
                type="text"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                placeholder="Ej: Gimnasio Central"
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
              />
            </label>

            {/* 🆕 Descripción */}
            <label className="block mb-10">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <FileText className="w-5 h-5" />
                <span>Descripción</span>
              </div>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Ej: Entrenamiento de táctica ofensiva y pases."
                rows="3"
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition resize-none"
              />
            </label>

            {/* Botón */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-3 rounded-full shadow-md flex items-center gap-2 transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                Crear {formData.tipo || "Evento"}
              </button>
            </div>
          </form>
        </main>

        <Footer />

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-in-out;
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
