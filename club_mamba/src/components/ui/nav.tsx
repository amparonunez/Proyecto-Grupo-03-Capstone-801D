"use client"; // 👈 si estás en App Router y necesitas interactividad
import Link from "next/link";
import { User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center border-b border-white">
      {/* Logo */}
      <div className="flex items-center gap-2">
        {/* <img src="/logo.png" alt="Mamba Logo" className="h-10 w-10" /> */}
        <div>
          <h1 className="text-yellow-400 font-extrabold text-lg">MAMBA</h1>
          <p className="text-xs text-yellow-500 -mt-1">CLUB MELIPILLA</p>
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 font-medium">
        <Link href="/" className="hover:text-yellow-400">Inicio</Link>
        <Link href="/pages/agenda" className="hover:text-yellow-400">Agenda</Link>
        <Link href="/pages/asistencia" className="hover:text-yellow-400">Asistencia</Link>
        <Link href="/pages/noticias" className="hover:text-yellow-400">Noticias</Link>
        <Link href="/pages/usuarios" className="hover:text-yellow-400 flex items-center gap-1">Usuarios</Link>
        <Link href="/pages/login" className="hover:text-yellow-400 flex items-center gap-1">
        <User size={20} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
