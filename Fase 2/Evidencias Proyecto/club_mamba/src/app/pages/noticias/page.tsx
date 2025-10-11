"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NoticiasPage() {
  const [rol, setRol] = useState(null);

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
      {/* Navbar */}
      <Nav />

      {/* Contenido principal */}
      <main className="flex-grow px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-gray-100">
          NOTICIAS
        </h1>

        {/* Tarjeta 1 */}
        <div className="bg-yellow-500 text-black p-6 rounded-xl mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-3">Anuncio importante</h2>
          <p className="text-lg mb-4">
            No habrá entrenamiento esta tarde, ocurrirá próximo viaje,
            eliminación de noticias. El Ponziha regional.
          </p>
          <div className="flex justify-between items-center text-sm font-medium">
            <span>10 de noviembre de 2023</span>
            <span>—</span>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-yellow-500 text-black p-6 rounded-xl mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-3">Nueva Equipación</h2>
          <p className="text-lg mb-4">
            Próxima incremento de materiales, oportunidades elipsis
            aproximadamente. Principal región.
          </p>
          <div className="flex justify-between items-center text-sm font-medium">
            <span>10 de noviembre de 2023</span>
            <span>—</span>
          </div>
        </div>

        {/* Botón para agregar noticias */}
        <div className="flex justify-center mt-10">
          {rol === 'entrenador' && (
          <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-yellow-400 transition">
            <Link href="/pages/crear_noticias">Agregar noticias</Link>
          </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
