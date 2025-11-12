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
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

// ✅ Tipo definido para una noticia
interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  imagen?: string;
}

export default function CrearNoticiaPage() {
  // Estados con tipado explícito
  const [formData, setFormData] = useState<Omit<Noticia, "id">>({
    titulo: "",
    contenido: "",
    fecha: "",
    imagen: "",
  });

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [mensaje, setMensaje] = useState<string>("");

  // Cargar noticias guardadas
  useEffect(() => {
    const stored = localStorage.getItem("noticias");
    if (stored) {
      setNoticias(JSON.parse(stored));
    }
  }, []);

  // Guardar noticias cuando cambian
  useEffect(() => {
    localStorage.setItem("noticias", JSON.stringify(noticias));
  }, [noticias]);

  // ✅ Tipado correcto del handleChange
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Tipado del formulario
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.titulo || !formData.contenido || !formData.fecha) {
      setMensaje("⚠️ Por favor completa todos los campos obligatorios.");
      return;
    }

    const nuevaNoticia: Noticia = {
      id: Date.now(),
      ...formData,
    };

    setNoticias((prev) => [nuevaNoticia, ...prev]);
    setFormData({ titulo: "", contenido: "", fecha: "", imagen: "" });
    setMensaje("✅ ¡Noticia creada exitosamente!");
  };

  return (
    <AuthGuard allowedRoles={["jugador", "entrenador"]}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Nav />

        <main className="flex-grow flex flex-col items-center py-16 px-6">
          <h1 className="text-5xl font-extrabold text-white mb-12 text-center">
            CREAR NOTICIA
          </h1>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#181818] w-full max-w-2xl p-10 rounded-2xl shadow-2xl border border-gray-800 animate-fadeIn"
          >
            {/* Título */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <Newspaper className="w-5 h-5" />
                <span>Título *</span>
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
                <span>Contenido *</span>
              </div>
              <textarea
                name="contenido"
                value={formData.contenido}
                onChange={handleChange}
                rows={5}
                placeholder="Escribe aquí el contenido de la noticia..."
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition resize-none"
              ></textarea>
            </label>

            {/* Fecha */}
            <label className="block mb-6">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <CalendarDays className="w-5 h-5" />
                <span>Fecha *</span>
              </div>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white focus:outline-none focus:border-yellow-400 transition"
              />
            </label>

            {/* Imagen */}
            <label className="block mb-8">
              <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold">
                <ImageIcon className="w-5 h-5" />
                <span>Imagen (opcional)</span>
              </div>
              <input
                type="text"
                name="imagen"
                value={formData.imagen ?? ""}
                onChange={handleChange}
                placeholder="URL de la imagen (ej: /img/noticia1.jpg)"
                className="w-full p-3 rounded-lg bg-[#1E1E1E] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
              />
            </label>

            {/* Mensaje */}
            {mensaje && (
              <p
                className={`text-center mb-6 font-semibold ${
                  mensaje.includes("✅") ? "text-green-400" : "text-red-400"
                }`}
              >
                {mensaje}
              </p>
            )}

            {/* Botón */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-3 rounded-full shadow-md flex items-center gap-2 transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                Crear Noticia
              </button>
            </div>
          </form>

          {/* Vista previa */}
          {noticias.length > 0 && (
            <section className="w-full max-w-5xl mt-16 animate-fadeIn">
              <h2 className="text-3xl font-bold mb-8 text-yellow-400 text-center">
                Noticias Creadas
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {noticias.map((noticia) => (
                  <div
                    key={noticia.id}
                    className="bg-[#1A1A1A] border border-gray-700 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-all"
                  >
                    {noticia.imagen && (
                      <img
                        src={noticia.imagen}
                        alt={noticia.titulo}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-2xl font-semibold text-yellow-400 mb-2">
                      {noticia.titulo}
                    </h3>
                    <p className="text-gray-300 mb-3">{noticia.contenido}</p>
                    <p className="text-sm text-gray-500">{noticia.fecha}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
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
