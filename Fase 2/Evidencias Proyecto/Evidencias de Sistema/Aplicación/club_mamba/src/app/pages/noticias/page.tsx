"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { EllipsisVertical, CalendarDays, Newspaper, PlusCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NoticiasPage() {
  const [rol, setRol] = useState<string | null>(null);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 🔐 Obtener rol
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      const r = await fetch("/api/usuarios/rol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const result = await r.json();
      if (r.ok && result.rol) setRol(result.rol);
    };

    fetchUserRole();
  }, []);

  // 📰 Obtener noticias desde Supabase vía API
  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await fetch("/api/noticias/ver_noticias");
        const data = await res.json();

        if (res.ok) {
          setNoticias(data.noticias || []);
        } else {
          toast.error("Error al cargar noticias");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  // 🗑️ Borrar noticia
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("¿Eliminar esta noticia?");
    if (!confirmDelete) return;

    const toastId = toast.loading("Eliminando...");

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      toast.dismiss(toastId);
      toast.error("No autenticado");
      return;
    }

    const res = await fetch("/api/noticias/borrar_noticias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId: user.id }),
    });

    const result = await res.json();
    toast.dismiss(toastId);

    if (res.ok) {
      toast.success("Noticia eliminada");
      setNoticias((prev) => prev.filter((n) => n.id !== id));
    } else {
      toast.error(result.error || "Error al eliminar");
    }
  };

  // ❌ Cerrar menú al hacer click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuVisible(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      {/* BOTÓN FLOTANTE (solo entrenador) */}
      {rol === "entrenador" && (
        <Link
          href="/pages/crear_noticias"
          className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-4 rounded-full shadow-xl flex items-center gap-2 transition-all z-50"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Noticia
        </Link>
      )}

      <main className="flex-grow max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-extrabold text-yellow-400 text-center mb-12 tracking-wider drop-shadow-lg">
          NOTICIAS DEL CLUB
        </h1>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* SIN NOTICIAS */}
        {!loading && noticias.length === 0 && (
          <div className="text-center mt-20">
            <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aún no hay noticias.</p>
          </div>
        )}

        {/* GRID ESTÉTICO DE NOTICIAS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {noticias.map((noticia: any) => (
            <div
              key={noticia.id}
              className="bg-[#181818] border border-gray-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all relative"
            >
              {/* Imagen */}
              {noticia.imagen && (
                <img
                  src={noticia.imagen}
                  alt={noticia.titulo}
                  className="w-full h-48 object-cover"
                />
              )}

              {/* Menú hamburguesa (solo entrenador) */}
              {rol === "entrenador" && (
                <div className="absolute top-3 right-3" ref={menuRef}>
                  <button
                    onClick={() =>
                      setMenuVisible(menuVisible === noticia.id ? null : noticia.id)
                    }
                    className="p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition"
                  >
                    <EllipsisVertical className="w-5 h-5 text-yellow-400" />
                  </button>

                  {/* Menú */}
                  {menuVisible === noticia.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-black border border-gray-700 rounded-lg shadow-xl overflow-hidden animate-fade-in">
                      <button
                        onClick={() => handleDelete(noticia.id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-800 transition w-full text-left"
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Contenido */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-yellow-400 mb-3">
                  {noticia.titulo}
                </h2>

                <p className="text-gray-300 text-sm mb-4">
                  {noticia.contenido}
                </p>

                <div className="flex items-center gap-2 text-gray-400 text-sm mt-4">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    {new Date(noticia.fecha).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-gray-500 text-xs mt-2 italic">
                  {noticia.usuarios
                    ? `${noticia.usuarios.nombre} ${noticia.usuarios.apellidos}`
                    : "Entrenador"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
