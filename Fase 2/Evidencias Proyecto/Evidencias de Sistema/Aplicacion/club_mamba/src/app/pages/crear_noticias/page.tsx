"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import {
  Newspaper,
  CalendarDays,
  FileText,
  CheckCircle,
  Image as ImageIcon,
  ArrowLeftCircle,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  imagen?: string;
}

export default function CrearNoticiaPage() {
  const [formData, setFormData] = useState<Omit<Noticia, "id">>({
    titulo: "",
    contenido: "",
    fecha: "",
    imagen: "",
  });

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [mensaje, setMensaje] = useState("");

  //  Cargar noticias guardadas
  useEffect(() => {
    const stored = localStorage.getItem("noticias");
    if (stored) setNoticias(JSON.parse(stored));
  }, []);

  //  Guardar cambios
  useEffect(() => {
    localStorage.setItem("noticias", JSON.stringify(noticias));
  }, [noticias]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.titulo || !formData.contenido || !formData.fecha) {
      setMensaje("⚠️ Debes completar todos los campos obligatorios.");
      return;
    }

    const nuevaNoticia: Noticia = {
      id: Date.now(),
      ...formData,
    };

    setNoticias((prev) => [nuevaNoticia, ...prev]);

    setFormData({ titulo: "", contenido: "", fecha: "", imagen: "" });
    setMensaje("✅ Noticia creada con éxito");
  };

  return (
    <AuthGuard allowedRoles={["jugador", "entrenador"]}>
      <div className="min-h-screen bg-black text-white flex flex-col relative">
        
        <Nav />

        {/* BOTÓN FLOTANTE PARA VOLVER */}
        <a
          href="/pages/noticias"
          className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-4 rounded-full shadow-xl flex items-center gap-2 transition-all"
        >
          <ArrowLeftCircle className="w-5 h-5" />
          Volver
        </a>

        <main className="flex-grow flex flex-col items-center py-16 px-6">
          <h1 className="text-5xl font-extrabold text-yellow-400 mb-12 text-center">
            CREAR NOTICIA
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-[#181818] w-full max-w-2xl p-10 rounded-2xl shadow-2xl border border-gray-800 animate-fadeIn"
          >
            {/* Título */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
                <Newspaper className="w-5 h-5" />
                <span>Título *</span>
              </div>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white"
              />
            </label>

            {/* Contenido */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
                <FileText className="w-5 h-5" />
                <span>Contenido *</span>
              </div>
              <textarea
                name="contenido"
                rows={5}
                value={formData.contenido}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white resize-none"
              />
            </label>

            {/* Fecha */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
                <CalendarDays className="w-5 h-5" />
                <span>Fecha *</span>
              </div>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white"
              />
            </label>

            {/* Imagen */}
            <label className="block mb-8">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
                <ImageIcon className="w-5 h-5" />
                <span>Imagen (opcional)</span>
              </div>
              <input
                type="text"
                name="imagen"
                value={formData.imagen}
                onChange={handleChange}
                placeholder="URL de imagen"
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white"
              />
            </label>

            {/* Mensaje */}
            {mensaje && (
              <p className="text-center mb-4 text-green-400">{mensaje}</p>
            )}

            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-10 py-3 rounded-full w-full"
            >
              Crear Noticia
            </button>
          </form>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
