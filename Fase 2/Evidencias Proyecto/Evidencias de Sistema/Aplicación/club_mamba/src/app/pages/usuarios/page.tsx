/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/components/AuthGuard";

export default function UsuariosPage() {
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [estadisticas, setEstadisticas] = useState<any | null>(null);

  // Cargar jugadores con estado de inscripción
  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const res = await fetch("/api/usuarios/ver_usuarios");
        const json = await res.json();
        if (json.error) throw new Error(json.error);

        // Consultar inscripciones de cada jugador
        const jugadoresConInscripcion = await Promise.all(
          json.data.map(async (jugador: any) => {
            try {
              const resInscripcion = await fetch("/api/usuarios/ver_inscripciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario_id: jugador.id }),
              });
              const dataIns = await resInscripcion.json();
              return { ...jugador, inscrito: dataIns.data?.inscrito ?? false };
            } catch {
              return { ...jugador, inscrito: false };
            }
          })
        );

        setJugadores(jugadoresConInscripcion);
      } catch (err) {
        console.error("Error cargando jugadores:", err);
      }
    };

    fetchJugadores();
  }, []);

  // Cargar estadísticas del jugador seleccionado
  useEffect(() => {
    if (!selectedUser) {
      setEstadisticas(null);
      return;
    }

    const fetchEstadisticas = async () => {
      try {
        const res = await fetch("/api/usuarios/ver_estadisticas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedUser.id }),
        });

        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setEstadisticas(json.data);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setEstadisticas(null);
      }
    };

    fetchEstadisticas();
  }, [selectedUser]);

  // Función para actualizar puesto o nivel
  const actualizarCampo = async (campo: string, valor: string) => {
    if (!selectedUser) return;
    try {
      await fetch("/api/usuarios/actualizar_puesto_nivel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id, [campo]: valor }),
      });

      setSelectedUser((prev: any) => ({ ...prev, [campo]: valor }));
      // Actualiza también en la lista principal
      setJugadores((prev) =>
        prev.map((jug) =>
          jug.id === selectedUser.id ? { ...jug, [campo]: valor } : jug
        )
      );
    } catch (err) {
      console.error(`Error actualizando ${campo}:`, err);
    }
  };

  return (
    <AuthGuard allowedRoles={["entrenador"]}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Nav />

        <main className="flex flex-col items-center py-16 flex-1">
          <h1 className="text-5xl font-bold mb-12">JUGADORES REGISTRADOS</h1>

          <section className="bg-[#181818] w-[900px] rounded-2xl shadow-2xl p-10 border border-gray-800">
            <div className="flex justify-between text-yellow-400 text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              <span>Jugador</span>
              <span>Estado</span>
              <span>Nivel</span>
            </div>

            {jugadores.length === 0 ? (
              <p className="text-gray-400 text-center py-6">
                No hay jugadores registrados.
              </p>
            ) : (
              <ul className="space-y-3">
                {jugadores.map((jugador) => (
                  <li
                    key={jugador.id}
                    onClick={() => setSelectedUser(jugador)}
                    className="flex justify-between items-center py-3 px-5 bg-[#1E1E1E] rounded-xl hover:bg-[#252525] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {jugador.foto_perfil ? (
                        <Image
                          src={`data:image/png;base64,${Buffer.from(
                            jugador.foto_perfil
                          ).toString("base64")}`}
                          alt={`${jugador.nombre} ${jugador.apellidos}`}
                          width={48}
                          height={48}
                          className="rounded-full border border-gray-700 object-cover"
                        />
                      ) : (
                        <Image
                          src="/img/user-avatar.png"
                          alt="avatar"
                          width={48}
                          height={48}
                          className="rounded-full border border-gray-700 object-cover"
                        />
                      )}
                      <span className="font-medium">{`${jugador.nombre} ${jugador.apellidos}`}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          jugador.inscrito ? "bg-green-500" : "bg-red-500"
                        }`}
                        title={jugador.inscrito ? "Inscrito" : "No inscrito"}
                      ></div>
                    </div>

                    <span className="text-yellow-400 capitalize">
                      {jugador.nivel}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <AnimatePresence>
            {selectedUser && (
              <motion.div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-[#181818] w-[500px] p-8 rounded-2xl border border-gray-700 shadow-2xl relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-5 text-gray-400 hover:text-yellow-400 text-2xl"
                  >
                    ✖
                  </button>

                  <div className="flex flex-col items-center mb-6">
                    {selectedUser.foto_perfil ? (
                      <Image
                        src={`data:image/png;base64,${Buffer.from(
                          selectedUser.foto_perfil
                        ).toString("base64")}`}
                        alt={`${selectedUser.nombre} ${selectedUser.apellidos}`}
                        width={96}
                        height={96}
                        className="rounded-full border-2 border-yellow-400 object-cover mb-4"
                      />
                    ) : (
                      <Image
                        src="/img/user-avatar.png"
                        alt="avatar"
                        width={96}
                        height={96}
                        className="rounded-full border-2 border-yellow-400 object-cover mb-4"
                      />
                    )}

                    <h2 className="text-3xl font-bold text-yellow-400">
                      {selectedUser.nombre} {selectedUser.apellidos}
                    </h2>
                  </div>

                  {/* Select editable de puesto */}
                  <div className="mb-4">
                    <label className="block text-white font-semibold mb-1">
                      Puesto:
                    </label>
                    <select
                      value={selectedUser.puesto}
                      disabled={!selectedUser.inscrito} 
                      onChange={(e) =>
                        actualizarCampo("puesto", e.target.value)
                      }
                      className="bg-[#1E1E1E] border border-gray-700 rounded-lg px-3 py-2 w-full"
                    >
                      <option value="base">Base</option>
                      <option value="escolta">Escolta</option>
                      <option value="alero">Alero</option>
                      <option value="ala-pívot">Ala-Pívot</option>
                      <option value="pívot">Pívot</option>
                    </select>
                  </div>

                  {/* Select editable de nivel */}
                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-1">
                      Nivel:
                    </label>
                    <select
                      value={selectedUser.nivel}
                      disabled={!selectedUser.inscrito}
                      onChange={(e) =>
                        actualizarCampo("nivel", e.target.value)
                      }
                      className="bg-[#1E1E1E] border border-gray-700 rounded-lg px-3 py-2 w-full"
                    >
                      <option value="novato">Novato</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>

                  {/* Estadísticas totales */}
                  {estadisticas && (
                    <div className="text-gray-300 space-y-2">
                      <h3 className="text-yellow-400 font-semibold text-xl mb-2">
                        Estadísticas Totales
                      </h3>
                      <p>
                        <span className="font-semibold text-white">
                          Partidos jugados:
                        </span>{" "}
                        {estadisticas.partidos_jugados}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Puntos:</span>{" "}
                        {estadisticas.total_puntos}
                      </p>
                      <p>
                        <span className="font-semibold text-white">
                          Rebotes:
                        </span>{" "}
                        {estadisticas.total_rebotes}
                      </p>
                      <p>
                        <span className="font-semibold text-white">
                          Asistencias:
                        </span>{" "}
                        {estadisticas.total_asistencias}
                      </p>
                      <p>
                        <span className="font-semibold text-white">Robos:</span>{" "}
                        {estadisticas.total_robos}
                      </p>
                      <p>
                        <span className="font-semibold text-white">
                          Bloqueos:
                        </span>{" "}
                        {estadisticas.total_bloqueos}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
