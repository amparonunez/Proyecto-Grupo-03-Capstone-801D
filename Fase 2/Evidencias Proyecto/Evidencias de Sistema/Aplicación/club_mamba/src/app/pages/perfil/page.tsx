"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<"datos" | "estadisticas">("datos");
  const [usuario, setUsuario] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [entrenador, setEntrenador] = useState<any>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const res = await fetch(`/api/perfil/ver_perfil?user_id=${user.id}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Error al cargar perfil");

        setUsuario({
          ...json.usuario,
          email: user.email,
          foto_perfil: json.usuario?.foto_perfil || null,
        });

        setStats(json.total);
        setEntrenador(json.entrenador);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };

    fetchPerfil();
  }, []);

  const fotoSrc =
    usuario?.foto_perfil && usuario.foto_perfil.trim() !== ""
      ? usuario.foto_perfil
      : "/img/user-avatar.png";

  return (
    <AuthGuard allowedRoles={["jugador", "entrenador"]}>
      <div className="min-h-screen bg-gray-100">
        <Nav />
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-6">
          <div className="bg-neutral-900 w-full max-w-4xl rounded-2xl shadow-xl p-10 flex flex-col md:flex-row gap-10 items-center md:items-start">

            {/* Columna izquierda */}
            <div className="flex flex-col items-center text-center w-full md:w-1/3">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-yellow-500 mb-4">
                <Image
                  src={fotoSrc}
                  alt="Foto de perfil"
                  width={160}
                  height={160}
                  className="object-cover"
                  unoptimized
                />
              </div>

              <h2 className="text-2xl font-semibold mb-1">
                {usuario ? `${usuario.nombre} ${usuario.apellidos}` : "Jugador"}
              </h2>
              <p className="text-sm text-neutral-400 capitalize">
                {usuario?.rol === "entrenador"
                  ? "Entrenador del club"
                  : usuario?.rol}
              </p>

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
                      <span className="font-medium">{usuario?.email || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-neutral-400 mb-1">Posición / Puesto</span>
                      <span className="font-medium capitalize">{usuario?.puesto}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-neutral-400 mb-1">Nivel</span>
                      <span className="font-medium capitalize">{usuario?.nivel}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-neutral-400 mb-1">Estatura</span>
                      <span className="font-medium">{usuario?.estatura || "—"} cm</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-neutral-400 mb-1">Peso</span>
                      <span className="font-medium">{usuario?.peso || "—"} kg</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-neutral-400 mb-1">Talla de uniforme</span>
                      <span className="font-medium">{usuario?.talla_uniforme || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-neutral-400 mb-1">RUT</span>
                      <span className="font-medium">{usuario?.rut || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-neutral-400 mb-1">Contacto de emergencia</span>
                      <span className="font-medium">{usuario?.contacto_emergencia || "—"}</span>
                    </div>
                  </div>

                  {usuario?.rol === "entrenador" && entrenador && (
                    <div className="mt-10 bg-neutral-800 p-6 rounded-lg">
                      <h4 className="text-lg text-yellow-400 font-semibold mb-4">
                        Sección de Entrenador
                      </h4>
                      <p>Total de entrenamientos: {entrenador.totalEntrenamientos}</p>
                      <p>Total de partidos: {entrenador.totalPartidos}</p>

                      {entrenador.recientes?.length > 0 && (
                        <>
                          <p className="mt-4 text-sm text-neutral-400">Últimos eventos creados:</p>
                          <ul className="mt-2 space-y-1 text-sm">
                            {entrenador.recientes.map((e: any) => (
                              <li key={e.id}>• {e.tipo} — {e.lugar} ({e.fecha})</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-10">
                    <Link
                      href="/pages/editar_perfil"
                      className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg transition inline-block"
                    >
                      Editar Perfil
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-yellow-500 border-b border-neutral-700 pb-2 mb-6">
                    Estadísticas del jugador
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                    <Stat label="Partidos" value={stats?.partidos || 0} />
                    <Stat label="Puntos" value={stats?.puntos || 0} />
                    <Stat label="Rebotes" value={stats?.rebotes || 0} />
                    <Stat label="Asistencias" value={stats?.asistencias || 0} />
                    <Stat label="Robos" value={stats?.robos || 0} />
                    <Stat label="Bloqueos" value={stats?.bloqueos || 0} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-neutral-800 rounded-lg p-4">
      <p className="text-3xl font-bold text-yellow-500">{value}</p>
      <p className="text-sm text-neutral-400 mt-1">{label}</p>
    </div>
  );
}
