"use client"; // 👈 si estás en App Router y necesitas interactividad
import Link from "next/link";
import { User } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
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
        <Link
          href="/pages/login"
          className="hover:text-yellow-400 flex items-center gap-1"
        >
          <User size={20} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
