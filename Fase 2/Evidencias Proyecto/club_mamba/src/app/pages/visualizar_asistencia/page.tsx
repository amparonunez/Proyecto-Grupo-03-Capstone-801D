"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import AuthGuard from "@/components/AuthGuard";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VisualizarAsistenciaPage() {
  const [evento, setEvento] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [jugadoresPresentes, setJugadoresPresentes] = useState([]);
  const [jugadoresAusentes, setJugadoresAusentes] = useState([]);
  const [totalesEquipo, setTotalesEquipo] = useState(null);
  const [jugadorActual, setJugadorActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  
  const searchParams = useSearchParams();
  const eventoParam = searchParams.get("id");

  // 🔄 Obtener ID del usuario logeado
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUsuarioId(user.id);
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }
    };

    obtenerUsuario();
  }, []);

  // 🔄 Cargar datos de asistencia
  useEffect(() => {
    const cargarAsistencia = async () => {
      try {
        setLoading(true);
        setMensaje("");

        if (!eventoParam) {
          setMensaje("❌ No se encontró ID de evento en la URL");
          setLoading(false);
          return;
        }

        const eventoIdNum = parseInt(eventoParam);
        if (isNaN(eventoIdNum)) {
          setMensaje("❌ ID de evento inválido");
          setLoading(false);
          return;
        }

        console.log("🔍 Cargando asistencia para evento:", eventoIdNum);

        // Construir URL con parámetros
        const url = `/api/asistencia/visualizar_asistencia?evento_id=${eventoIdNum}${usuarioId ? `&usuario_id=${usuarioId}` : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar la asistencia");
        }

        if (!data.evento || !data.jugadores) {
          throw new Error("No se encontraron datos de asistencia para este evento");
        }

        setEvento(data.evento);
        setJugadores(data.jugadores);
        
        // Separar jugadores presentes y ausentes
        const presentes = data.jugadores.filter(j => j.presente);
        const ausentes = data.jugadores.filter(j => !j.presente);
        
        setJugadoresPresentes(presentes);
        setJugadoresAusentes(ausentes);
        setTotalesEquipo(data.totalesEquipo);
        setJugadorActual(data.jugadorActual);

      } catch (error) {
        console.error("❌ Error cargando asistencia:", error);
      } finally {
        setLoading(false);
      }
    };

    if (eventoParam) {
      cargarAsistencia();
    }
  }, [eventoParam, usuarioId]);

  // Función para formatear fecha
  const formatearFecha = (fecha, hora) => {
    try {
      const fechaObj = new Date(`${fecha}T${hora}`);
      return fechaObj.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return `${fecha} ${hora}`;
    }
  };

  // Función para formatear tiempo
  const formatearTiempo = (tiempoStr) => {
    if (!tiempoStr) return "00:00";
    
    // Si el tiempo está en formato "MM:SS"
    if (tiempoStr.includes(':')) {
      return tiempoStr;
    }
    
    // Si es un número (segundos)
    const segundos = parseInt(tiempoStr);
    if (!isNaN(segundos)) {
      const minutos = Math.floor(segundos / 60);
      const seg = segundos % 60;
      return `${String(minutos).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
    }
    
    return "00:00";
  };

  // Componente para la tabla de jugadores
  const TablaJugadores = ({ jugadores, titulo, tipo }) => (
    <div className="mb-8">
      <h3 className={`text-2xl font-bold mb-4 ${
        tipo === 'presentes' ? 'text-green-400' : 'text-red-400'
      }`}>
        {titulo} ({jugadores.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className={`border-b ${
              tipo === 'presentes' ? 'border-green-600 text-green-400' : 'border-red-600 text-red-400'
            }`}>
              <th className="py-3 text-left">Jugador</th>
              <th>Presente</th>
              <th>Puntos</th>
              <th>Rebotes</th>
              <th>Asistencias</th>
              <th>Robos</th>
              <th>Bloqueos</th>
            </tr>
          </thead>
          <tbody>
            {jugadores.map((jugador) => (
              <tr 
                key={jugador.id} 
                className={`border-b border-gray-700 hover:bg-[#252525] transition ${
                  jugador.esJugadorActual ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
                }`}
              >
                <td className="py-3 font-medium text-left">
                  <div className="flex items-center">
                    {jugador.nombre} {jugador.apellidos}
                    {jugador.esJugadorActual && (
                      <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">TÚ</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{jugador.puesto}</div>
                </td>
                <td className={`text-2xl ${
                  tipo === 'presentes' ? "text-green-500" : "text-red-500"
                }`}>
                  {tipo === 'presentes' ? "✔" : "✖"}
                </td>
                <td className={`font-semibold ${
                  jugador.puntos > 0 ? "text-yellow-400" : "text-gray-400"
                }`}>
                  {jugador.puntos}
                </td>
                <td className={jugador.rebotes > 0 ? "text-white" : "text-gray-400"}>
                  {jugador.rebotes}
                </td>
                <td className={jugador.asistencias > 0 ? "text-white" : "text-gray-400"}>
                  {jugador.asistencias}
                </td>
                <td className={jugador.robos > 0 ? "text-white" : "text-gray-400"}>
                  {jugador.robos}
                </td>
                <td className={jugador.bloqueos > 0 ? "text-white" : "text-gray-400"}>
                  {jugador.bloqueos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AuthGuard allowedRoles={["entrenador", "jugador"]}>
        <div className="min-h-screen bg-gray-100">
          <Nav />
          <main className="min-h-screen bg-black text-white flex justify-center items-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              <p className="text-gray-400 mt-4">Cargando asistencia...</p>
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["entrenador", "jugador"]}>
      <div className="min-h-screen bg-gray-100">
        <Nav />
        <main className="min-h-screen bg-black text-white py-16">
          <div className="container mx-auto px-4">
            <section className="bg-[#181818] rounded-2xl shadow-2xl p-8 border border-gray-800">
              
              {/* MENSAJES */}
              {mensaje && (
                <div className={`text-center mb-6 p-4 rounded-lg ${
                  mensaje.includes("❌") ? "bg-red-900/50 border border-red-700" : 
                  "bg-green-900/50 border border-green-700"
                }`}>
                  <p className="font-semibold">{mensaje}</p>
                </div>
              )}

              {/* ENCABEZADO DEL EVENTO */}
              {evento && (
                <div className="mb-8 text-center">
                  <h1 className="text-4xl font-bold mb-4">VISUALIZAR ASISTENCIA</h1>
                  <h2 className="text-yellow-400 text-2xl font-semibold capitalize">{evento.tipo}</h2>
                  <p className="mt-1">{formatearFecha(evento.fecha, evento.hora)}</p>
                  {evento.lugar && <p className="text-gray-300">📍 {evento.lugar}</p>}
                  {evento.descripcion && (
                    <p className="text-gray-400 text-sm mt-2 max-w-2xl mx-auto">{evento.descripcion}</p>
                  )}
                  <p className="mt-2 text-lg text-gray-300">
                    Duración: <span className="text-yellow-400">{formatearTiempo(evento.duracion)}</span>
                  </p>
                  
                  {/* ✅ INFORMACIÓN DEL ENTRENADOR */}
                  {evento.entrenador && (
                    <div className="mt-4 p-3 bg-purple-900/30 border border-purple-700 rounded-lg inline-block">
                      <p className="text-sm text-purple-300">
                        🏀 Organizado por: <span className="font-semibold text-purple-400">
                          {evento.entrenador.nombre} {evento.entrenador.apellidos}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MARCADOR DEL JUGADOR ACTUAL */}
              {jugadorActual && (
                <div className="mb-8 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">🎯 Tu Desempeño</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-300">Estado</p>
                      <p className={`text-lg font-bold ${jugadorActual.presente ? "text-green-400" : "text-red-400"}`}>
                        {jugadorActual.presente ? "✅ Presente" : "❌ Ausente"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Puntos</p>
                      <p className="text-lg font-bold text-yellow-400">{jugadorActual.puntos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Rebotes</p>
                      <p className="text-lg font-bold text-yellow-400">{jugadorActual.rebotes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Asistencias</p>
                      <p className="text-lg font-bold text-yellow-400">{jugadorActual.asistencias}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Robos</p>
                      <p className="text-lg font-bold text-yellow-400">{jugadorActual.robos}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Bloqueos</p>
                      <p className="text-lg font-bold text-yellow-400">{jugadorActual.bloqueos}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TOTALES DEL EQUIPO */}
              {totalesEquipo && totalesEquipo.totalJugadores > 0 && (
                <div className="bg-[#1E1E1E] rounded-xl p-6 mb-8">
                  <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4">
                    Resumen del Equipo
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg">👥 Total Jugadores</p>
                      <p className="text-2xl font-bold">{totalesEquipo.totalJugadores}</p>
                    </div>
                    <div>
                      <p className="text-lg">✅ Presentes</p>
                      <p className="text-2xl font-bold text-green-400">{totalesEquipo.presentes}</p>
                    </div>
                    <div>
                      <p className="text-lg">❌ Ausentes</p>
                      <p className="text-2xl font-bold text-red-400">{totalesEquipo.ausentes}</p>
                    </div>
                    <div>
                      <p className="text-lg">🎯 Asistencia</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {Math.round((totalesEquipo.presentes / totalesEquipo.totalJugadores) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* JUGADORES PRESENTES */}
              {jugadoresPresentes.length > 0 && (
                <TablaJugadores 
                  jugadores={jugadoresPresentes}
                  titulo="✅ Jugadores Presentes"
                  tipo="presentes"
                />
              )}

              {/* JUGADORES AUSENTES */}
              {jugadoresAusentes.length > 0 && (
                <TablaJugadores 
                  jugadores={jugadoresAusentes}
                  titulo="❌ Jugadores Ausentes"
                  tipo="ausentes"
                />
              )}

              {/* SIN DATOS */}
              {jugadores.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-xl">No hay datos de asistencia para mostrar</p>
                </div>
              )}

              {/* BOTÓN VOLVER */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => window.history.back()}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-10 rounded-xl text-lg transition-all shadow-md"
                >
                  Volver
                </button>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}