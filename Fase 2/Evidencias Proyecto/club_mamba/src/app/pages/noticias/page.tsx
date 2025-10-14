"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { EllipsisVertical } from "lucide-react"; // icono tres puntos
import toast from "react-hot-toast"; 

export default function NoticiasPage() {
  const [rol, setRol] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);



  // 🧠 Obtener el rol del usuario autenticado (para mostrar el botón de agregar)
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

  // 📰 Cargar noticias desde la API (todos los usuarios pueden verlas)
  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await fetch("/api/ver_noticias");
        const result = await res.json();

        if (res.ok) {
          setNoticias(result.noticias || []);
        } else {
          console.error("Error al obtener noticias:", result.error);
        }
      } catch (error) {
        console.error("Error al conectar con API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  // 🗑️ Borrar noticia con toast
const handleDelete = async (id: number) => {
  const confirmDelete = confirm("¿Seguro que deseas eliminar esta noticia?");
  if (!confirmDelete) return;

  const toastId = toast.loading("Eliminando noticia...");

  try {
    // 🧠 Obtener el usuario autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.dismiss(toastId);
      toast.error("No estás autenticado");
      return;
    }

    // 📡 Llamar a la API con userId
    const res = await fetch("/api/borrar_noticias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId: user.id }),
    });

    const result = await res.json();
    toast.dismiss(toastId);

    if (res.ok) {
      toast.success("🗑️ Noticia eliminada correctamente");
      setNoticias((prev) => prev.filter((n) => n.id !== id));
    } else {
      toast.error(result.error || "Error al eliminar noticia");
    }
  } catch (error) {
    console.error(error);
    toast.dismiss(toastId);
    toast.error("Error interno del cliente");
  }
};

   // 🔲 Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuVisible(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      <main className="flex-grow px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-gray-100">
          NOTICIAS
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : noticias.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mt-20">
            No hay noticias disponibles por el momento.
          </p>
        ) : (
          noticias.map((noticia) => (
            <div
              key={noticia.id}
              className="bg-yellow-500 text-black p-6 rounded-xl mb-6 shadow-lg relative transition hover:bg-yellow-400 hover:scale-[1.01]"
            >
              {/* Botón de tres puntos */}
              {rol === "entrenador" && (
                <div className="absolute top-4 right-4" ref={menuRef}>
                  <button
                    onClick={() =>
                      setMenuVisible(menuVisible === noticia.id ? null : noticia.id)
                    }
                    className="p-1 rounded-full hover:bg-yellow-300 transition"
                  >
                    <EllipsisVertical size={24} />
                  </button>

                  {/* Menú animado */}
                  <div
                    className={`absolute right-0 mt-2 w-44 rounded-lg overflow-hidden shadow-xl z-10 transition-all duration-200 origin-top-right ${
                      menuVisible === noticia.id
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    } bg-[#181818] text-gray-100`}
                  >
                    {/* <Link
                      href={`/pages/editar_noticia?id=${noticia.id}`}
                      className="block px-4 py-2 hover:bg-gray-700 transition"
                    >
                      ✏️ Editar noticia
                    </Link> */}
                    <button
                      onClick={() => handleDelete(noticia.id)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 transition"
                    >
                      🗑️ Borrar noticia
                    </button>
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold mb-3">{noticia.titulo}</h2>
              <p className="text-lg mb-4">{noticia.contenido}</p>
              <div className="flex flex-col text-sm font-medium">
                <span className="text-gray-700">
                  {new Date(noticia.fecha).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-gray-800 mt-1">
                  {noticia.usuarios
                    ? `${noticia.usuarios.nombre} ${noticia.usuarios.apellidos}`
                    : "Entrenador"}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Agregar noticia */}
        {rol === "entrenador" && (
          <div className="flex justify-center mt-10">
            <Link href="/pages/crear_noticias">
              <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-yellow-400 transition">
                Agregar noticia
              </button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
