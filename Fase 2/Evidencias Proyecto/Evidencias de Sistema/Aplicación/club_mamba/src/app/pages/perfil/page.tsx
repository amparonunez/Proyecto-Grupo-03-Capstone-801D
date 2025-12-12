"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

type Perfil = {
  id: string;
  nombre: string;
  rol?: string;
  puesto?: string;
  nivel?: string;
  peso?: number | string;
  talla_uniforme?: string;
  contacto_emergencia?: string;
  estatura?: string | number;
  email?: string;
};

type Estadisticas = {
  partidos_jugados?: number;
  total_puntos?: number;
  total_rebotes?: number;
  total_asistencias?: number;
  total_robos?: number;
  total_bloqueos?: number;
};

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<"datos" | "estadisticas">("datos");
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [error, setError] = useState("");
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoadingPerfil(true);
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          setError(userError.message);
          setLoadingPerfil(false);
          return;
        }

        if (!user) {
          setLoadingPerfil(false);
          return;
        }

        setUserEmail(user.email ?? "");

        const res = await fetch("/api/usuarios/datos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id }),
        });

        const result = await res.json();

        if (res.ok && result.data) {
          setPerfil(result.data);
        } else {
          setError(result.error || "No se pudieron cargar los datos del perfil.");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar el perfil."
        );
      } finally {
        setLoadingPerfil(false);
      }
    };

    fetchPerfil();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!perfil?.id) return;
      try {
        setLoadingStats(true);
        setStatsError("");

        const res = await fetch("/api/usuarios/ver_estadisticas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: perfil.id }),
        });

        const result = await res.json();
        if (res.ok && result.data) {
          setEstadisticas(result.data);
        } else {
          setStatsError(result.error || "No se pudieron cargar las estadísticas.");
        }
      } catch (err) {
        setStatsError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar las estadísticas."
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [perfil?.id]);

  const tieneValor = (valor: string | number | null | undefined) =>
    valor !== null && valor !== undefined && valor !== "";

  const formatearDato = (
    valor: string | number | null | undefined,
    fallback = "No disponible"
  ) => (tieneValor(valor) ? valor : fallback);

  return (
    <AuthGuard allowedRoles={["jugador", "entrenador"]}>
      <div className="min-h-screen bg-gray-100">
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

              <h2 className="text-2xl font-semibold mb-1">
                {formatearDato(perfil?.nombre, "Perfil sin nombre")}
              </h2>
              <p className="text-sm text-neutral-400">
                {perfil?.rol === "entrenador"
                  ? "Entrenador del club"
                  : "Jugador del equipo"}
              </p>

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

                  {loadingPerfil && (
                    <p className="text-neutral-400">Cargando datos...</p>
                  )}

                  {error && (
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                  )}

                  {/* GRILLA DE DATOS */}
                  {!loadingPerfil && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">

                      {/* Correo */}
                      <div className="flex flex-col">
                        <span className="text-neutral-400 mb-1">Correo electrónico</span>
                        <span className="font-medium">
                          {formatearDato(userEmail || perfil?.email, "Sin correo registrado")}
                        </span>
                      </div>

                      {/* Posición */}
                      <div className="flex flex-col">
                        <span className="text-neutral-400 mb-1">Posición</span>
                        <span className="font-medium">
                          {formatearDato(perfil?.puesto, "Sin definir")}
                        </span>
                      </div>

                      {/* Estatus */}
                      <div className="flex flex-col">
                        <span className="text-neutral-400 mb-1">Estatus</span>
                        <span className="text-green-500 font-semibold">Activo</span>
                      </div>

                      {/* Nivel */}
                      <div className="flex flex-col">
                        <span className="text-neutral-400 mb-1">Nivel</span>
                        <span className="font-medium">
                          {formatearDato(perfil?.nivel, "No registrado")}
                        </span>
                      </div>

                      {/* Estatura */}
                      <div className="flex flex-col">
                        <span className="text-neutral-400 mb-1">Estatura</span>
                        <span className="font-medium">
                          {formatearDato(perfil?.estatura, "No registrada")} cm
                        </span>
                      </div>

                      {/* Peso */}
                      <div className="flex flex-col">
                        <span className="text-neutral-400 mb-1">Peso</span>
                        <span className="font-medium">
                          {perfil?.peso ? `${perfil.peso} kg` : "No registrado"}
                        </span>
                      </div>

                      {/* Talla uniforme */}
                      <div className="flex flex-col">
                        <span className="text-neutral-400 mb-1">Talla de uniforme</span>
                        <span className="font-medium">
                          {formatearDato(perfil?.talla_uniforme, "No registrada")}
                        </span>
                      </div>

                      {/* Contacto emergencia */}
                      <div className="flex flex-col">
                        <span className="text-neutral-400 mb-1">Contacto de emergencia</span>
                        <span className="font-medium">
                          {formatearDato(perfil?.contacto_emergencia, "No registrado")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botón editar */}
                  <div className="mt-10">
                    <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg transition">
                      <Link href="/pages/editar_perfil">Editar Perfil</Link>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-yellow-500 border-b border-neutral-700 pb-2 mb-6">
                    Estadísticas del jugador
                  </h3>

                  {loadingStats ? (
                    <p className="text-neutral-400">Cargando estadísticas...</p>
                  ) : statsError ? (
                    <p className="text-red-400 text-sm mb-4">{statsError}</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                      <div className="bg-neutral-800 rounded-lg p-4">
                        <p className="text-3xl font-bold text-yellow-500">
                          {estadisticas?.partidos_jugados ?? 0}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Partidos</p>
                      </div>

                      <div className="bg-neutral-800 rounded-lg p-4">
                        <p className="text-3xl font-bold text-yellow-500">
                          {estadisticas?.total_puntos ?? 0}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Puntos</p>
                      </div>

                      <div className="bg-neutral-800 rounded-lg p-4">
                        <p className="text-3xl font-bold text-yellow-500">
                          {estadisticas?.total_asistencias ?? 0}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Asistencias</p>
                      </div>

                      <div className="bg-neutral-800 rounded-lg p-4">
                        <p className="text-3xl font-bold text-yellow-500">
                          {estadisticas?.total_rebotes ?? 0}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Rebotes</p>
                      </div>

                      <div className="bg-neutral-800 rounded-lg p-4">
                        <p className="text-3xl font-bold text-yellow-500">
                          {estadisticas?.total_robos ?? 0}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Robos</p>
                      </div>

                      <div className="bg-neutral-800 rounded-lg p-4">
                        <p className="text-3xl font-bold text-yellow-500">
                          {estadisticas?.total_bloqueos ?? 0}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1">Bloqueos</p>
                      </div>
                    </div>
                  )}
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
