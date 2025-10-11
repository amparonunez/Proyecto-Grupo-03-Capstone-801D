"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }
    const user = data.user;

    // 🔹 1. Pedimos los datos del usuario desde el backend (ignora RLS)
    const res = await fetch("/api/usuarios/datos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });

    const result = await res.json();

    if (res.ok && result.data) {
      localStorage.setItem("nombreUsuario", result.data.nombre);
      localStorage.setItem("rolUsuario", result.data.rol);
    } else {
      console.error(result.error);
    }

    // Si el login es exitoso
    setLoading(false);
    router.push("/"); // Redirige a la página principal
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[black]">
      <div className="bg-[#181818] text-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-yellow-400">
          Iniciar Sesión
        </h2>
        <p className="text-sm text-center text-yellow-500 mt-1 mb-6">
          Bienvenido de nuevo a MAMBA CLUB
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            required
            onChange={handleChange}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            onChange={handleChange}
            className="px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-500 transition"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/pages/register"
            className="text-yellow-400 hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
