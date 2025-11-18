"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { Newspaper, CalendarDays, Trash2, PlusCircle } from "lucide-react";

interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  imagen?: string;
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("noticias");
    if (stored) setNoticias(JSON.parse(stored));
  }, []);

  const eliminarNoticia = (id: number) => {
    const filtradas = noticias.filter((n) => n.id !== id);
    setNoticias(filtradas);
    localStorage.setItem("noticias", JSON.stringify(filtradas));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      {/* BOTÓN FLOTANTE CREAR NOTICIA */}
      <a
        href="/pages/crear_noticias"
        className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-4 rounded-full shadow-xl flex items-center gap-2 transition-all"
      >
        <PlusCircle className="w-5 h-5" />
        Nueva Noticia
      </a>

      <main className="flex-grow max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-extrabold text-yellow-400 text-center mb-12">
          NOTICIAS DEL CLUB
        </h1>

        {noticias.length === 0 ? (
          <div className="text-center mt-20">
            <Newspaper className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay noticias aún.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {noticias.map((noticia) => (
              <div
                key={noticia.id}
                className="bg-[#181818] border border-gray-700 rounded-2xl overflow-hidden shadow-lg relative"
              >
                {noticia.imagen && (
                  <img
                    src={noticia.imagen}
                    alt={noticia.titulo}
                    className="w-full h-48 object-cover"
                  />
                )}

                {/* Botón eliminar */}
                <button
                  onClick={() => eliminarNoticia(noticia.id)}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 p-2 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                    {noticia.titulo}
                  </h2>

                  <p className="text-gray-300 text-sm mb-4">
                    {noticia.contenido}
                  </p>

                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <CalendarDays className="w-4 h-4" />
                    <span>{noticia.fecha}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
