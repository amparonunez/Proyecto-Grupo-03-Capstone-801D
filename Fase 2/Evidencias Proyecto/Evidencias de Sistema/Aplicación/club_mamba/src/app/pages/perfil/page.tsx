"use client";


import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";



export default function PefilPage() {
    const [activeTab, setActiveTab] = useState<"datos" | "estadisticas">("datos");

  return (
    <AuthGuard allowedRoles={["jugador", "entrenador"]}>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <Nav />
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-6">

     {/* Contenedor principal */}
      <div className="bg-neutral-900 w-full max-w-4xl rounded-2xl shadow-xl p-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
        {/* Columna izquierda */}
        <div className="flex flex-col items-center text-center w-full md:w-1/3">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-yellow-500 mb-4">
            <Image
              src="/img/user-avatar.png"
              alt="Foto de perfil"
              width={160}
              height={160}
              className="object-cover"
            />
          </div>
          <h2 className="text-2xl font-semibold mb-1">Javier Contreras</h2>
          <p className="text-sm text-neutral-400">Jugador del equipo senior</p>

          {/* Botones de pestañas */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setActiveTab("datos")}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                activeTab === "datos"
                  ? "bg-yellow-500 text-black"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              Datos
            </button>
            <button
              onClick={() => setActiveTab("estadisticas")}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                activeTab === "estadisticas"
                  ? "bg-yellow-500 text-black"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              Estadísticas
            </button>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex-1 w-full">
          {activeTab === "datos" ? (
            <>
              <h3 className="text-xl font-semibold text-yellow-500 border-b border-neutral-700 pb-2 mb-6">
                Datos del perfil
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-neutral-400 mb-1">Correo electrónico</span>
                  <span className="font-medium">javio@example.com</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-400 mb-1">Posición</span>
                  <span className="font-medium">Escolta</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-400 mb-1">Estatus</span>
                  <span className="text-green-500 font-semibold">Activo</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-400 mb-1">Nivel</span>
                  <span className="font-medium">Avanzado</span>
                </div>
              </div>

              {/* Botón editar */}
              <div className="mt-10">
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg transition">
                  <Link href="/pages/editar_perfil">
                  Editar Perfil
                  </Link>
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-yellow-500 border-b border-neutral-700 pb-2 mb-6">
                Estadísticas del jugador
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-3xl font-bold text-yellow-500">24</p>
                  <p className="text-sm text-neutral-400 mt-1">Partidos</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-3xl font-bold text-yellow-500">312</p>
                  <p className="text-sm text-neutral-400 mt-1">Puntos</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-3xl font-bold text-yellow-500">58</p>
                  <p className="text-sm text-neutral-400 mt-1">Asistencias</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-3xl font-bold text-yellow-500">40</p>
                  <p className="text-sm text-neutral-400 mt-1">Rebotes</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-3xl font-bold text-yellow-500">18</p>
                  <p className="text-sm text-neutral-400 mt-1">Robos</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-3xl font-bold text-yellow-500">3</p>
                  <p className="text-sm text-neutral-400 mt-1">Bloqueos</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    {/* Footer */}
      <Footer />
    </div>
    </AuthGuard>
  );
}