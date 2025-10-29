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
  const [estadisticas, setEstadisticas] = useState<any[]>([]);

  // Fetch jugadores
  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const res = await fetch("/api/usuarios/ver_usuarios");
        const json = await res.json();

        if (json.error) throw new Error(json.error);
        setJugadores(json.data);
      } catch (err) {
        console.error("Error cargando jugadores:", err);
      }
    };
    fetchJugadores();
  }, []);

  // Fetch estadísticas solo cuando hay jugador seleccionado
  useEffect(() => {
    if (!selectedUser) {
      setEstadisticas([]); // limpiar al cerrar modal
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
        setEstadisticas([]);
      }
    };

    fetchEstadisticas();
  }, [selectedUser]);

  return (
    <AuthGuard allowedRoles={["entrenador"]}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Nav />

        <main className="flex flex-col items-center py-16 flex-1">
          <h1 className="text-5xl font-bold mb-12">JUGADORES REGISTRADOS</h1>

          <section className="bg-[#181818] w-[900px] rounded-2xl shadow-2xl p-10 border border-gray-800">
            <div className="flex justify-between text-yellow-400 text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              <span>Jugador</span>
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

                  <div className="text-gray-300 space-y-2 mb-6">
                    <p>
                      <span className="font-semibold text-white">Puesto: </span>
                      {selectedUser.puesto}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Nivel: </span>
                      {selectedUser.nivel}
                    </p>
                  </div>

                  {estadisticas.length > 0 && (
                    <div className="text-gray-300 space-y-2">
                      <h3 className="text-yellow-400 font-semibold text-xl mb-2">Estadísticas</h3>
                      {estadisticas.map((est) => (
                        <div key={est.id} className="grid grid-cols-2 gap-2">
                          <p><span className="font-semibold text-white">Puntos:</span> {est.puntos}</p>
                          <p><span className="font-semibold text-white">Rebotes:</span> {est.rebotes}</p>
                          <p><span className="font-semibold text-white">Asistencias:</span> {est.asistencias}</p>
                          <p><span className="font-semibold text-white">Robos:</span> {est.robos}</p>
                          <p><span className="font-semibold text-white">Bloqueos:</span> {est.bloqueos}</p>
                        </div>
                      ))}
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
