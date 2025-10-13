"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NoticiasPage() {
  const [rol, setRol] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar */}
      <Nav />

      {/* Contenido principal */}
      <main className="flex-grow px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-gray-100">
          NOTICIAS
        </h1>

        {/* Loader mientras se cargan */}
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
              className="bg-yellow-500 text-black p-6 rounded-xl mb-6 shadow-lg transition hover:bg-yellow-400 hover:scale-[1.01]"
            >
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

        {/* Botón para agregar noticias solo para entrenadores */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
