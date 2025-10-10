"use client"; // 👈 si estás en App Router y necesitas interactividad

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cierra el menú al hacer clic fuera
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
        <Link href="/pages/asistencia" className="hover:text-yellow-400">
          Asistencia
        </Link>
        <Link
          href="/pages/usuarios"
          className="hover:text-yellow-400 flex items-center gap-1"
        >
          Usuarios
        </Link>

        {/* Menú de usuario */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-1 hover:text-yellow-400 transition"
          >
            <User size={22} />
          </button>

          {menuAbierto && (
            <div className="absolute right-0 mt-3 w-48 bg-[#181818] border border-gray-700 rounded-xl shadow-lg animate-fadeIn">
              <ul className="flex flex-col text-sm font-medium">
                <li>
                  <Link
                    href="/pages/login"
                    className="block px-4 py-3 hover:bg-yellow-500 hover:text-black rounded-t-xl transition"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Logearse
                  </Link>
                </li>
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
                    onClick={() => {
                      setMenuAbierto(false);
                      alert("Sesión cerrada correctamente.");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-yellow-500 hover:text-black rounded-b-xl transition"
                  >
                    Cerrar Sesión
                  </button>
                </li>
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
