"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function AsistenciaPage() {
  const [jugadores, setJugadores] = useState([
    { nombre: "Juan Paner", presente: false, puntos: 0, rebotes: 0, asistencias: 0, robos: 0, bloqueos: 0 },
    { nombre: "Carlos Reige", presente: false, puntos: 0, rebotes: 0, asistencias: 0, robos: 0, bloqueos: 0 },
    { nombre: "Mauricio Díaz", presente: false, puntos: 0, rebotes: 0, asistencias: 0, robos: 0, bloqueos: 0 },
    { nombre: "Javier Contreras", presente: false, puntos: 0, rebotes: 0, asistencias: 0, robos: 0, bloqueos: 0 },
    { nombre: "Rodrigo Acalla", presente: false, puntos: 0, rebotes: 0, asistencias: 0, robos: 0, bloqueos: 0 },
  ]);

  const [fase, setFase] = useState("asistencia"); // asistencia | partido | finalizado
  const [jugando, setJugando] = useState(false);
  const [tiempo, setTiempo] = useState(0);

  // ⏱ Timer
  useEffect(() => {
    let intervalo;
    if (jugando) {
      intervalo = setInterval(() => setTiempo((t) => t + 1), 1000);
    }
    return () => clearInterval(intervalo);
  }, [jugando]);

  // ✅ Formatear tiempo
  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(minutos).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  };

  // ✅ Cambiar asistencia
  const toggleAsistencia = (index) => {
    const updated = [...jugadores];
    updated[index].presente = !updated[index].presente;
    setJugadores(updated);
  };

  // ✅ Editar estadísticas
  const cambiarEstadistica = (index, campo, valor) => {
    const updated = [...jugadores];
    updated[index][campo] = Number(valor);
    setJugadores(updated);
  };

  // 🎯 Guardar asistencia y pasar a la fase del partido
  const comenzarPartido = () => {
    const presentes = jugadores.filter((j) => j.presente);
    if (presentes.length === 0) {
      alert("No hay jugadores presentes para iniciar el partido.");
      return;
    }

    setJugadores(presentes); // solo los que están presentes participan
    setFase("partido");
    setJugando(true);
    setTiempo(0);
  };

  // 🛑 Finalizar el partido
  const finalizarPartido = () => {
    setJugando(false);
    setFase("finalizado");
    const tiempoFinal = formatearTiempo(tiempo);
    alert(`🏁 Partido o entrenamiento terminado\n⏱️ Duración total: ${tiempoFinal}`);
  };

  // 📊 Calcular resumen
  const totalEquipo = {
    puntos: jugadores.reduce((a, j) => a + j.puntos, 0),
    rebotes: jugadores.reduce((a, j) => a + j.rebotes, 0),
    asistencias: jugadores.reduce((a, j) => a + j.asistencias, 0),
    robos: jugadores.reduce((a, j) => a + j.robos, 0),
    bloqueos: jugadores.reduce((a, j) => a + j.bloqueos, 0),
  };

  const jugadoresOrdenados = [...jugadores].sort((a, b) => b.puntos - a.puntos);

  return (
    <AuthGuard allowedRoles={["entrenador"]}>
    <div className="min-h-screen bg-gray-100">
      <Nav />

      <main className="min-h-screen bg-[black] text-white flex flex-col items-center py-20">
        <section className="bg-[#181818] w-[900px] rounded-2xl shadow-2xl p-10 border border-gray-800">
          <h1 className="text-4xl font-bold text-center mb-10 text-white">
            {fase === "asistencia" && "REGISTRAR ASISTENCIA 📝"}
            {fase === "partido" && "CONTROL DE PARTIDO 🏀"}
            {fase === "finalizado" && "RESUMEN DEL PARTIDO ✅"}
          </h1>

          {/* --- FASE 1: ASISTENCIA --- */}
          {fase === "asistencia" && (
            <>
              <div className="space-y-3 mb-10">
                {jugadores.map((jugador, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-[#1E1E1E] hover:bg-[#252525] transition-colors px-6 py-4 rounded-xl"
                  >
                    <span className="text-lg">{jugador.nombre}</span>
                    <button
                      onClick={() => toggleAsistencia(index)}
                      className={`text-2xl font-bold ${
                        jugador.presente ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {jugador.presente ? "✔" : "✖"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={comenzarPartido}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-10 rounded-xl text-lg transition-all shadow-md"
                >
                  Iniciar Partido
                </button>
              </div>
            </>
          )}

          {/* --- FASE 2: PARTIDO EN CURSO --- */}
          {fase === "partido" && (
            <>
              {/* Timer y botón */}
              <div className="flex justify-center items-center gap-6 mb-10">
                <div className="text-5xl font-mono text-yellow-400">
                  {formatearTiempo(tiempo)}
                </div>

                {jugando && (
                  <button
                    onClick={finalizarPartido}
                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all shadow-md"
                  >
                    Finalizar Partido
                  </button>
                )}
              </div>

              {/* Estadísticas editables */}
              <h2 className="text-2xl font-semibold text-center text-yellow-400 mb-6">
                Estadísticas en tiempo real
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="text-yellow-400 border-b border-gray-600">
                      <th className="py-3">Jugador</th>
                      <th>Puntos</th>
                      <th>Rebotes</th>
                      <th>Asistencias</th>
                      <th>Robos</th>
                      <th>Bloqueos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jugadores.map((jugador, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-[#252525] transition"
                      >
                        <td className="py-3 font-medium">{jugador.nombre}</td>
                        {["puntos", "rebotes", "asistencias", "robos", "bloqueos"].map((campo) => (
                          <td key={campo}>
                            <input
                              type="number"
                              value={jugador[campo]}
                              onChange={(e) =>
                                cambiarEstadistica(index, campo, e.target.value)
                              }
                              className="w-20 text-center bg-[#1E1E1E] border border-gray-600 rounded-lg py-1 text-white focus:outline-none focus:border-yellow-400"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* --- FASE 3: PARTIDO FINALIZADO --- */}
          {fase === "finalizado" && (
            <div className="text-center text-yellow-400 text-xl font-semibold py-10">
              <h2 className="text-3xl mb-6">Resumen del Partido 🏁</h2>
              <p className="mb-4">⏱️ Duración total: {formatearTiempo(tiempo)}</p>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="text-yellow-400 border-b border-gray-600">
                      <th className="py-3">Jugador</th>
                      <th>Puntos</th>
                      <th>Rebotes</th>
                      <th>Asistencias</th>
                      <th>Robos</th>
                      <th>Bloqueos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jugadoresOrdenados.map((jugador, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-[#252525] transition"
                      >
                        <td className="py-3 font-medium">{jugador.nombre}</td>
                        <td>{jugador.puntos}</td>
                        <td>{jugador.rebotes}</td>
                        <td>{jugador.asistencias}</td>
                        <td>{jugador.robos}</td>
                        <td>{jugador.bloqueos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 text-lg text-white">
                <p><strong>Total equipo:</strong></p>
                <p>🏀 Puntos: {totalEquipo.puntos}</p>
                <p>💪 Rebotes: {totalEquipo.rebotes}</p>
                <p>🎯 Asistencias: {totalEquipo.asistencias}</p>
                <p>🕵️ Robos: {totalEquipo.robos}</p>
                <p>🧱 Bloqueos: {totalEquipo.bloqueos}</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
    </AuthGuard>
  );
}
