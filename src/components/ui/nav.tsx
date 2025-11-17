"use client"; // 👈 si estás en App Router y necesitas interactividad

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Calendar,
  CheckSquare,
  Users,
  User,
  Menu,
} from "lucide-react";

import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState(null); // guarda el usuario autenticado
  const [nombre, setNombre] = useState(
    localStorage.getItem("nombreUsuario") || ""
  ); // ⚡ carga instantánea
  const menuRef = useRef(null);
  const [rol, setRol] = useState(null);
  const router = useRouter();

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

      // ✅ Pedir rol al backend (usa service_role, ignora RLS)
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

    router.push("/");

    window.location.reload(); // recarga para limpiar estado
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

  const links = [
    { name: "Inicio", href: "/", icon: <Home size={20} /> },
    { name: "Agenda", href: "/pages/agenda", icon: <Calendar size={20} /> },
    {
      name: "Asistencia",
      href: "/pages/asistencia",
      icon: <CheckSquare size={20} />,
      roles: ["jugador", "entrenador"],
    },
    {
      name: "Usuarios",
      href: "/pages/usuarios",
      icon: <Users size={20} />,
      roles: ["entrenador"],
    },
  ];
  return (
    <nav className="bg-black text-white px-15 py-9 md:py-4 flex justify-between items-center border-b border-white">
      {/* Logo */}
      <div className="hidden md:flex items-center gap-2">
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

      {/* Logo Movil*/}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex md:hidden items-center justify-center">
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
      <div className="hidden md:flex items-center gap-6 font-medium">
        <Link href="/" className="hover:text-yellow-400">
          Inicio
        </Link>
        <Link href="/pages/agenda" className="hover:text-yellow-400">
          Agenda
        </Link>
        {(rol === "jugador" || rol === "entrenador") && (
          <Link href="/pages/asistencia" className="hover:text-yellow-400">
            Asistencia
          </Link>
        )}
        {rol === "entrenador" && (
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

      <div className="md:hidden">
        {" "}
        {/* 👈 todo esto solo visible en móviles */}
        {/* Botón hamburguesa */}
        <button
          onClick={() => setMenuAbierto(true)}
          className="fixed top-5 left-5 z-50 bg-[#111] p-2 rounded-lg border border-yellow-400"
        >
          <Menu size={24} className="text-yellow-400" />
        </button>
        {/* Sidebar móvil */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-[#222] text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out z-50 ${
      menuAbierto ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mt-6 mb-8">
              <Image
                src="/img/Mamba logo render.png"
                alt="Mamba Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <div className="flex flex-col">
                <span className="text-yellow-400 font-extrabold text-xl">
                  MAMBA
                </span>
                <span className="text-xs text-yellow-500 font-medium tracking-wider">
                  MELIPILLA CLUB
                </span>
              </div>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-2 px-6">
              {links.map((link) => {
                if (link.roles && !link.roles.includes(rol)) return null;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMenuAbierto(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
                  >
                    <span className="text-yellow-400">{link.icon}</span>
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Usuario */}
      <div className="border-t border-[#222] flex items-center justify-between px-6 py-4">
  <div className="flex items-center gap-3">
    <button
      className="flex items-center gap-2 hover:text-yellow-400 transition"
      onClick={() => {
        setMenuAbierto(false);
        if (usuario) {
          router.push("/pages/perfil");
        } else {
          router.push("/pages/login");
        }
      }}
    >
      <User className="text-yellow-400" size={20} />
      <span className="font-medium text-sm">
        {usuario ? nombre : "Iniciar Sesión"}
      </span>
    </button>
  </div>

  {usuario && (
    <button
      onClick={() => {
      setMenuAbierto(false);
      handleLogout();
    }}
      className="text-xs text-gray-400 hover:text-yellow-400"
    >
      Salir
    </button>
  )}
</div>
        </aside>
        {/* Fondo oscuro difuminado */}
        <div
          onClick={() => setMenuAbierto(false)}
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-30 ${
            menuAbierto
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        ></div>
        {/* Botón hamburguesa (solo visible cuando el menú está cerrado) */}
        {!menuAbierto && (
          <button
            onClick={() => setMenuAbierto(true)}
            className="fixed top-5 left-5 z-50 bg-[#111] p-2 rounded-lg border border-yellow-400 transition-opacity duration-300"
          >
            <Menu size={24} className="text-yellow-400" />
          </button>
        )}
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
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

