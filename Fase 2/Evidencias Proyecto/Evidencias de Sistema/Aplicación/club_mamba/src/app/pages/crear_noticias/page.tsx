"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { Newspaper, CalendarDays, FileText, CheckCircle, XCircle } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

export default function CrearNoticiaPage() {
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    fecha: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.contenido || !formData.fecha) {
      showToast("Por favor completa todos los campos.", "error");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showToast("Debes iniciar sesión para crear una noticia.", "error");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/noticias/agregar_noticias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: formData.titulo,
          contenido: formData.contenido,
          fecha: formData.fecha,
          userId: user.id,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast("✅ ¡Noticia creada exitosamente!", "success");
        setFormData({ titulo: "", contenido: "", fecha: "" });
      } else {
        showToast(`❌ Error: ${result.error || "No se pudo crear la noticia"}`, "error");
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      showToast("Ocurrió un error inesperado.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["entrenador"]}>
      <div className="min-h-screen bg-black text-white flex flex-col relative">
        <Nav />

        <main className="flex-grow flex flex-col items-center py-16 px-6">
          <h1 className="text-5xl font-extrabold text-white mb-12 text-center">
            CREAR NOTICIA
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-[#181818] w-full max-w-2xl p-10 rounded-2xl shadow-2xl border border-gray-800 animate-fadeIn"
          >
            {/* Título */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <Newspaper className="w-5 h-5" />
                <span>Título</span>
              </div>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ingresa el título de la noticia"
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
              />
            </label>

            {/* Contenido */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <FileText className="w-5 h-5" />
                <span>Contenido</span>
              </div>
              <textarea
                name="contenido"
                value={formData.contenido}
                onChange={handleChange}
                rows="5"
                placeholder="Escribe aquí el contenido de la noticia..."
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition resize-none"
              ></textarea>
            </label>

            {/* Fecha */}
            <label className="block mb-8">
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

            {/* Botón */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-400"
                } text-black font-semibold px-8 py-3 rounded-full shadow-md flex items-center gap-2 transition-all`}
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? "Creando..." : "Crear Noticia"}
              </button>
            </div>
          </form>
        </main>

        <Footer />

        {/* 🔔 Toast visual */}
        {toast.visible && (
          <div
            className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl font-semibold transition-all duration-300 ${
              toast.type === "success"
                ? "bg-yellow-400 text-black"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Animaciones */}
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
