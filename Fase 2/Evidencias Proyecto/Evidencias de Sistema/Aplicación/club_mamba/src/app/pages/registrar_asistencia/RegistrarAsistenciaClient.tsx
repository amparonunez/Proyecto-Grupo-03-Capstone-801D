"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/components/AuthGuard";
import { useSearchParams } from "next/navigation";

export default function RegistrarAsistenciaClient() {
  const [jugadores, setJugadores] = useState([]);
  const [fase, setFase] = useState("asistencia");
  const [jugando, setJugando] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [animando, setAnimando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventoId, setEventoId] = useState(null);
  const [eventoInfo, setEventoInfo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(false);
  
  const searchParams = useSearchParams();
  const eventoParam = searchParams.get("id");

  // ✅ NUEVA VERSIÓN CON VERIFICACIÓN DE ASISTENCIA EXISTENTE
  useEffect(() => {
    const cargarDatosEvento = async () => {
      try {
        setCargando(true);
        setMensaje("");
        console.log("🚀 INICIANDO CARGA CON VERIFICACIÓN DE ASISTENCIA...");

        if (!eventoParam) {
          setMensaje("❌ No se encontró ID de evento en la URL");
          setCargando(false);
          return;
        }

        const eventoIdNum = parseInt(eventoParam);
        if (isNaN(eventoIdNum)) {
          setMensaje("❌ ID de evento inválido");
          setCargando(false);
          return;
        }

        setEventoId(eventoIdNum);
        console.log("🎯 Evento ID:", eventoIdNum);

        // 🔄 PASO 1: Verificar que el evento existe
        console.log("📋 PASO 1 - Verificando evento...");
        const resEvento = await fetch(`/api/eventos/verificar?id=${eventoIdNum}`);
        const dataEvento = await resEvento.json();
        
        console.log("📋 Respuesta evento:", dataEvento);

        if (!resEvento.ok) {
          throw new Error(dataEvento.error || "Error al verificar evento");
        }

        if (!dataEvento.evento) {
          throw new Error("Evento no encontrado");
        }

        setEventoInfo(dataEvento.evento);
        console.log("✅ Evento encontrado:", dataEvento.evento);

        // 🔄 NUEVO PASO: Verificar si ya existe asistencia para este evento
        console.log("🔍 VERIFICANDO ASISTENCIA EXISTENTE...");
        const resAsistencia = await fetch(`/api/asistencia/verificar?evento_id=${eventoIdNum}`);
        const dataAsistencia = await resAsistencia.json();
        
        console.log("🔍 Respuesta verificación asistencia:", dataAsistencia);

        if (resAsistencia.ok && dataAsistencia.existe) {
          setAsistenciaRegistrada(true);
          setMensaje("⚠️ La asistencia para este evento ya fue registrada anteriormente");
          setCargando(false);
          return;
        }

        // 🔄 PASO 2: Obtener inscripciones del evento
        console.log("👥 PASO 2 - Buscando inscripciones...");
        const resInscripciones = await fetch(`/api/inscripciones/evento?evento_id=${eventoIdNum}`);
        const dataInscripciones = await resInscripciones.json();
        
        console.log("👥 Respuesta inscripciones:", dataInscripciones);

        if (!resInscripciones.ok) {
          throw new Error(dataInscripciones.error || "Error al cargar inscripciones");
        }

        if (!dataInscripciones.inscripciones || dataInscripciones.inscripciones.length === 0) {
          setMensaje("ℹ️ No hay jugadores inscritos en este evento");
          setJugadores([]);
          setCargando(false);
          return;
        }

        console.log("📊 Inscripciones encontradas:", dataInscripciones.inscripciones.length);

        // 🔄 PASO 3: Obtener datos de los usuarios
        const userIds = dataInscripciones.inscripciones.map(insc => insc.usuario_id);
        console.log("🆔 User IDs encontrados:", userIds);

        console.log("👤 PASO 3 - Buscando usuarios...");
        const resUsuarios = await fetch('/api/usuarios/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_ids: userIds }),
        });

        const dataUsuarios = await resUsuarios.json();
        console.log("👤 Respuesta usuarios:", dataUsuarios);

        if (!resUsuarios.ok) {
          throw new Error(dataUsuarios.error || "Error al cargar datos de usuarios");
        }

        if (!dataUsuarios.usuarios || dataUsuarios.usuarios.length === 0) {
          throw new Error("No se pudieron cargar los datos de los jugadores");
        }

        // 🎯 CREAR ARRAY DE JUGADORES
        const jugadoresInicial = dataUsuarios.usuarios.map(usuario => ({
          id: usuario.id,
          nombre: usuario.nombre || "Jugador",
          apellidos: usuario.apellidos || "",
          puesto: usuario.puesto || "Sin definir",
          presente: false,
          puntos: 0,
          rebotes: 0,
          asistencias: 0,
          robos: 0,
          bloqueos: 0,
        }));

        console.log("🎮 Jugadores creados:", jugadoresInicial);
        setJugadores(jugadoresInicial);
        // ❌ QUITAMOS EL MENSAJE DE JUGADORES CARGADOS
        setMensaje("");
        
      } catch (error) {
        console.error("💥 Error en carga:", error);
        setMensaje(`❌ ${error.message}`);
      } finally {
        setCargando(false);
        console.log("🏁 Carga finalizada");
      }
    };

    cargarDatosEvento();
  }, [eventoParam]);

  // 🕒 Timer
  useEffect(() => {
    let intervalo;
    if (jugando) {
      intervalo = setInterval(() => setTiempo(t => t + 1), 1000);
    }
    return () => clearInterval(intervalo);
  }, [jugando]);

  // ⏱️ Formatear tiempo
  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(minutos).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  };

  // 🎯 Funciones de UI
  const toggleAsistencia = (index) => {
    const updated = [...jugadores];
    updated[index].presente = !updated[index].presente;
    setJugadores(updated);
  };

  const cambiarEstadistica = (index, campo, valor) => {
    const updated = [...jugadores];
    const numValor = parseInt(valor) || 0;
    updated[index][campo] = Math.max(0, numValor);
    setJugadores(updated);
  };

  const transicionFase = (nuevaFase, callbackExtra = () => {}) => {
    setAnimando(true);
    setTimeout(() => {
      setFase(nuevaFase);
      callbackExtra();
      setTimeout(() => setAnimando(false), 300);
    }, 400);
  };

  // 🏀 Comenzar partido
  const comenzarPartido = () => {
    const presentes = jugadores.filter(j => j.presente);
    
    if (presentes.length < 2) {
      alert("Se necesitan al menos 2 jugadores presentes para iniciar el partido");
      return;
    }

    transicionFase("partido", () => {
      setJugadores(presentes);
      setJugando(true);
      setTiempo(0);
    });
  };

  // 💾 Finalizar partido y guardar
  const finalizarPartido = async () => {
    console.log("💾 DEBUG FINALIZAR - Iniciando...");
    
    if (!eventoId) {
      console.error("❌ DEBUG FINALIZAR - No hay eventoId");
      setMensaje("❌ Error: No hay evento seleccionado");
      return;
    }

    const tiempoFinal = formatearTiempo(tiempo);
    setLoading(true);

    try {
      const totalEquipo = {
        puntos: jugadores.reduce((sum, j) => sum + j.puntos, 0),
        rebotes: jugadores.reduce((sum, j) => sum + j.rebotes, 0),
        asistencias: jugadores.reduce((sum, j) => sum + j.asistencias, 0),
        robos: jugadores.reduce((sum, j) => sum + j.robos, 0),
        bloqueos: jugadores.reduce((sum, j) => sum + j.bloqueos, 0),
      };

      const datosAEnviar = {
        evento_id: eventoId,
        jugadores: jugadores,
        totalEquipo: totalEquipo,
        duracion: tiempoFinal,
      };

      console.log("📤 DEBUG FINALIZAR - Enviando datos:", datosAEnviar);

      const response = await fetch("/api/asistencia/registrar_asistencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosAEnviar),
      });

      console.log("📨 DEBUG FINALIZAR - Respuesta HTTP:", response.status, response.statusText);
      
      const data = await response.json();
      console.log("📨 DEBUG FINALIZAR - Datos respuesta:", data);

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      setMensaje(`✅ ${data.message}`);
      setAsistenciaRegistrada(true); // Marcar como registrada
      transicionFase("finalizado");
      
    } catch (error) {
      console.error("❌ DEBUG FINALIZAR - Error al guardar:", error);
      setMensaje(`❌ Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
      setJugando(false);
    }
  };

  // 📊 Totales para mostrar
  const totalEquipo = {
    puntos: jugadores.reduce((sum, j) => sum + j.puntos, 0),
    rebotes: jugadores.reduce((sum, j) => sum + j.rebotes, 0),
    asistencias: jugadores.reduce((sum, j) => sum + j.asistencias, 0),
    robos: jugadores.reduce((sum, j) => sum + j.robos, 0),
    bloqueos: jugadores.reduce((sum, j) => sum + j.bloqueos, 0),
  };

  const jugadoresOrdenados = [...jugadores].sort((a, b) => b.puntos - a.puntos);

  return (
    <AuthGuard allowedRoles={["entrenador"]}>
      <div className="min-h-screen bg-gray-100">
        <Nav />

        <main className="min-h-screen bg-black text-white flex flex-col items-center py-20">
          {/* MENSAJES DE ESTADO */}
          {mensaje && (
            <div className={`text-center mb-4 p-4 rounded-lg max-w-2xl w-full mx-4 ${
              mensaje.includes("❌") ? "bg-red-900/50 border border-red-700" : 
              mensaje.includes("⚠️") ? "bg-yellow-900/50 border border-yellow-700" : 
              mensaje.includes("ℹ️") ? "bg-blue-900/50 border border-blue-700" :
              "bg-green-900/50 border border-green-700"
            }`}>
              <p className="font-semibold">{mensaje}</p>
            </div>
          )}

          {/* ❌ QUITAMOS LA INFORMACIÓN DEL EVENTO QUE ESTABA AQUÍ */}

          <motion.section
            key={fase}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
              scaleY: animando ? 0 : 1,
              opacity: animando ? 0 : 1,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="origin-top bg-[#181818] w-full max-w-4xl rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-800 mx-4"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 text-white">
              {fase === "asistencia" && "REGISTRAR ASISTENCIA 📝"}
              {fase === "partido" && "CONTROL DE PARTIDO 🏀"}
              {fase === "finalizado" && "PARTIDO FINALIZADO ✅"}
            </h1>

            <AnimatePresence mode="wait">
              {/* BLOQUEAR SI YA EXISTE ASISTENCIA */}
              {asistenciaRegistrada ? (
                <motion.div
                  key="bloqueado"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-10"
                >
                  <div className="text-yellow-400 text-6xl mb-4">🔒</div>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                    Asistencia Ya Registrada
                  </h2>
                  <p className="text-gray-300 text-lg mb-6">
                    La asistencia para este evento ya fue registrada anteriormente y no puede ser modificada.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    ← Volver Atrás
                  </button>
                </motion.div>
              ) : fase === "asistencia" ? (
                <motion.div
                  key="asistencia"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  {cargando ? (
                    <div className="text-center py-10">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                      <p className="text-gray-400 mt-4">Cargando jugadores inscritos...</p>
                    </div>
                  ) : jugadores.length > 0 ? (
                    <>
                      <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
                        {jugadores.map((jugador, index) => (
                          <div
                            key={jugador.id}
                            className="flex justify-between items-center bg-[#1E1E1E] hover:bg-[#252525] transition-colors px-4 py-3 rounded-xl"
                          >
                            <div>
                              <span className="text-lg font-medium">
                                {jugador.nombre} {jugador.apellidos}
                              </span>
                              <span className="text-sm text-gray-400 ml-2">({jugador.puesto})</span>
                            </div>
                            <button
                              onClick={() => toggleAsistencia(index)}
                              className={`text-2xl font-bold transition-transform hover:scale-110 ${
                                jugador.presente ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {jugador.presente ? "✔" : "✖"}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="text-center mb-4">
                        <p className="text-lg">
                          Jugadores presentes: <span className="text-yellow-400 font-bold">
                            {jugadores.filter(j => j.presente).length} / {jugadores.length}
                          </span>
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={comenzarPartido}
                          disabled={jugadores.filter(j => j.presente).length < 2}
                          className={`${
                            jugadores.filter(j => j.presente).length < 2 
                              ? "bg-gray-600 cursor-not-allowed" 
                              : "bg-yellow-500 hover:bg-yellow-400 transform hover:scale-105"
                          } text-black font-bold py-3 px-8 rounded-xl text-lg transition-all shadow-lg`}
                        >
                          {jugadores.filter(j => j.presente).length < 2 
                            ? `Mínimo 2 jugadores (faltan ${2 - jugadores.filter(j => j.presente).length})` 
                            : "🎯 Iniciar Partido"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-400 text-xl">No hay jugadores inscritos en este evento</p>
                    </div>
                  )}
                </motion.div>
              ) : fase === "partido" ? (
                <motion.div
                  key="partido"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* CABECERA CON TIMER Y BOTÓN */}
                  <div className="flex justify-center items-center gap-6 mb-10">
                    <div className="text-5xl font-mono text-yellow-400">
                      ⏱️ {formatearTiempo(tiempo)}
                    </div>

                    <button
                      onClick={finalizarPartido}
                      disabled={loading}
                      className={`${
                        loading ? "bg-gray-600" : "bg-red-600 hover:bg-red-500 transform hover:scale-105"
                      } text-white font-bold py-3 px-6 rounded-xl text-lg transition-all shadow-lg flex items-center gap-2`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Guardando...
                        </>
                      ) : (
                        "🏁 Finalizar Partido"
                      )}
                    </button>
                  </div>

                  {/* ESTADÍSTICAS */}
                  <h2 className="text-2xl font-semibold text-center text-yellow-400 mb-6">
                    Estadísticas en Tiempo Real
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="text-yellow-400 border-b border-gray-600">
                          <th className="py-3 text-left">Jugador</th>
                          <th className="px-2">PTS</th>
                          <th className="px-2">REB</th>
                          <th className="px-2">AST</th>
                          <th className="px-2">ROB</th>
                          <th className="px-2">BLK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jugadores.map((jugador, index) => (
                          <tr
                            key={jugador.id}
                            className="border-b border-gray-700 hover:bg-[#252525] transition"
                          >
                            <td className="py-3 font-medium text-left">
                              {jugador.nombre} {jugador.apellidos}
                            </td>
                            {["puntos", "rebotes", "asistencias", "robos", "bloqueos"].map(
                              (campo) => (
                                <td key={campo} className="py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={jugador[campo]}
                                    onChange={(e) => cambiarEstadistica(index, campo, e.target.value)}
                                    className="w-16 text-center bg-[#1E1E1E] border border-gray-600 rounded-lg py-1 text-white focus:outline-none focus:border-yellow-400"
                                  />
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : fase === "finalizado" ? (
                <motion.div
                  key="finalizado"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl text-yellow-400 mb-4">🏆 Partido Finalizado</h2>
                    <p className="text-xl">⏱️ Duración: {formatearTiempo(tiempo)}</p>
                  </div>

                  {/* TABLA DE RESULTADOS */}
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="text-yellow-400 border-b border-gray-600">
                          <th className="py-3 text-left">Jugador</th>
                          <th>PTS</th>
                          <th>REB</th>
                          <th>AST</th>
                          <th>ROB</th>
                          <th>BLK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jugadoresOrdenados.map((jugador) => (
                          <tr
                            key={jugador.id}
                            className="border-b border-gray-700 hover:bg-[#252525] transition"
                          >
                            <td className="py-3 font-medium text-left">
                              {jugador.nombre} {jugador.apellidos}
                            </td>
                            <td className="py-3">{jugador.puntos}</td>
                            <td className="py-3">{jugador.rebotes}</td>
                            <td className="py-3">{jugador.asistencias}</td>
                            <td className="py-3">{jugador.robos}</td>
                            <td className="py-3">{jugador.bloqueos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* TOTALES DEL EQUIPO */}
                  <div className="bg-[#1E1E1E] rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4">
                      Totales del Equipo
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <p className="text-lg">🏀 Puntos</p>
                        <p className="text-2xl font-bold">{totalEquipo.puntos}</p>
                      </div>
                      <div>
                        <p className="text-lg">💪 Rebotes</p>
                        <p className="text-2xl font-bold">{totalEquipo.rebotes}</p>
                      </div>
                      <div>
                        <p className="text-lg">🎯 Asistencias</p>
                        <p className="text-2xl font-bold">{totalEquipo.asistencias}</p>
                      </div>
                      <div>
                        <p className="text-lg">🕵️ Robos</p>
                        <p className="text-2xl font-bold">{totalEquipo.robos}</p>
                      </div>
                      <div>
                        <p className="text-lg">🧱 Bloqueos</p>
                        <p className="text-2xl font-bold">{totalEquipo.bloqueos}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.section>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}