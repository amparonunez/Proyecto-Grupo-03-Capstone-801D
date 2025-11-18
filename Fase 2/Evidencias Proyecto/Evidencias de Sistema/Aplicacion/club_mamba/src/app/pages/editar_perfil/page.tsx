"use client";

import { useState } from "react";
import Image from "next/image";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { Camera, Mail, Lock, User } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

export default function EditarPerfilPage() {
  const [foto, setFoto] = useState("/img/user-avatar.png");
  const [formData, setFormData] = useState({
    nombre: "Javier",
    apellido: "Contreras",
    email: "javio@example.com",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Perfil actualizado correctamente!");
  };

  return (
    <AuthGuard allowedRoles={["jugador", "entrenador"]}>
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      <main className="flex flex-col items-center py-16 px-6 flex-grow">
        <h1 className="text-5xl font-extrabold text-yellow-400 mb-12 text-center">
          EDITAR PERFIL
        </h1>

        {/* Contenedor principal */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#181818] w-full max-w-3xl p-10 rounded-2xl shadow-2xl border border-gray-800 animate-fadeIn"
        >
          {/* Sección de foto */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-yellow-500">
              <Image
                src={foto}
                alt="Foto de perfil"
                width={160}
                height={160}
                className="object-cover"
              />
              <label className="absolute bottom-2 right-2 bg-yellow-500 p-2 rounded-full cursor-pointer hover:bg-yellow-400 transition">
                <Camera className="text-black w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </label>
            </div>
            <p className="text-neutral-400 text-sm mt-3">
              Haz clic en el ícono para cambiar la foto
            </p>
          </div>

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-yellow-400 font-semibold mb-2 block">
                <User className="inline w-4 h-4 mr-2" />
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-yellow-400 font-semibold mb-2 block">
                <User className="inline w-4 h-4 mr-2" />
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-yellow-400 font-semibold mb-2 block">
              <Mail className="inline w-4 h-4 mr-2" />
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="mt-6">
            <label className="text-yellow-400 font-semibold mb-2 block">
              <Lock className="inline w-4 h-4 mr-2" />
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
              placeholder="Nueva contraseña"
            />
          </div>

          {/* Botón guardar */}
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-3 rounded-full shadow-md flex items-center gap-2 transition"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </main>

      <Footer />

      {/* Animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
      `}</style>
    </div>
    </AuthGuard>
  );
}
