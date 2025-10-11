"use client"; // 👈 si estás en App Router y necesitas interactividad

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState(null); // guarda el usuario autenticado
  const [nombre, setNombre] = useState(
    localStorage.getItem("nombreUsuario") || ""
  ); // ⚡ carga instantánea
  const menuRef = useRef(null);
  const [rol, setRol] = useState(null);


  // 🔹 Obtener sesión y datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUsuario(user);

        // si no hay nombre almacenado, lo consultamos
        if (!localStorage.getItem("nombreUsuario")) {
          const { data, error } = await supabase
            .from("usuarios")
            .select("nombre")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            setNombre(data.nombre);
            localStorage.setItem("nombreUsuario", data.nombre);
          }
        }
      }
    };

    fetchUser();

    const fetchUserRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("No hay usuario logueado");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setRol(data.rol);
      }
    };

    fetchUserRole();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUsuario(null);
        setNombre("");
        localStorage.removeItem("nombreUsuario");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("nombreUsuario");
    setUsuario(null);
    setNombre("");
  };
  // 🔹 Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-black text-white px-15 py-4 flex justify-between items-center border-b border-white">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="/img/Mamba logo render.png"
          alt="Mamba Logo"
          width={120}
          height={120}
          className="h-15 w-15"
        />
        <div>
          {/* <h1 className="text-yellow-400 font-extrabold text-lg">MAMBA</h1>
          <p className="text-xs text-yellow-500 -mt-1">CLUB MELIPILLA</p> */}
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 font-medium">
        <Link href="/" className="hover:text-yellow-400">
          Inicio
        </Link>
        <Link href="/pages/agenda" className="hover:text-yellow-400">
          Agenda
        </Link>
        { (rol === "jugador" || rol === "entrenador") && (
        <Link href="/pages/asistencia" className="hover:text-yellow-400">
          Asistencia
        </Link>
        )}
        { rol === "entrenador" && (
        <Link
          href="/pages/usuarios"
          className="hover:text-yellow-400 flex items-center gap-1"
        >
          Usuarios
        </Link>
        )}

        {/* Menú de usuario */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-2 hover:text-yellow-400 transition"
          >
            <User size={22} />
            {usuario && <span className="text-sm font-semibold">{nombre}</span>}
          </button>

          {menuAbierto && (
            <div className="absolute right-0 mt-3 w-48 bg-[#181818] border border-gray-700 rounded-xl shadow-lg animate-fadeIn">
              <ul className="flex flex-col text-sm font-medium">
                {/* Solo mostrar "Iniciar Sesion" si NO está autenticado */}
                {!usuario && (
                  <li>
                    <Link
                      href="/pages/login"
                      className="block px-4 py-3 hover:bg-yellow-500 hover:text-black rounded-t-xl transition"
                      onClick={() => setMenuAbierto(false)}
                    >
                      Iniciar Sesión
                    </Link>
                  </li>
                )}

                {/* Mostrar perfil y cerrar sesión si hay usuario */}
                {usuario && (
                  <>
                    <li>
                      <Link
                        href="/pages/perfil"
                        className="block px-4 py-3 hover:bg-yellow-500 hover:text-black transition"
                        onClick={() => setMenuAbierto(false)}
                      >
                        Ver Perfil
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-yellow-500 hover:text-black rounded-b-xl transition"
                      >
                        Cerrar Sesión
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Animación */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
