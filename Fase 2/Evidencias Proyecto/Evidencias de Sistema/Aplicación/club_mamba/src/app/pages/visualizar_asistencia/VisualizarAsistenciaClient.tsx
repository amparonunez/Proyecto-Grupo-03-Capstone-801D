"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import AuthGuard from "@/components/AuthGuard";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VisualizarAsistenciaCLient() {
  const [evento, setEvento] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [jugadoresPresentes, setJugadoresPresentes] = useState([]);
  const [jugadoresAusentes, setJugadoresAusentes] = useState([]);
  const [totalesEquipo, setTotalesEquipo] = useState(null);
  const [jugadorActual, setJugadorActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [menuPuntosAbierto, setMenuPuntosAbierto] = useState(false);
  
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
        const totalesRecalculados = calcularTotales(data.jugadores);
        
        // Separar jugadores presentes y ausentes
        const presentes = data.jugadores.filter(j => j.presente);
        const ausentes = data.jugadores.filter(j => !j.presente);
        
        setJugadoresPresentes(presentes);
        setJugadoresAusentes(ausentes);
        setTotalesEquipo({
          ...(data.totalesEquipo || {}),
          ...totalesRecalculados
        });
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

  const sumarEstadistica = (lista, clave) => {
    if (!lista || lista.length === 0) return 0;
    return lista.reduce((acc, item) => acc + (Number(item?.[clave]) || 0), 0);
  };

  const obtenerPuntosJugador = (jugador) => {
    const triples = Number(jugador?.triples ?? jugador?.triple ?? 0);
    const dobles = Number(jugador?.dobles ?? 0);
    const libres = Number(jugador?.tiros_libres ?? jugador?.tirosLibres ?? 0);
    const calculado = triples * 3 + dobles * 2 + libres;
    const puntos = Number(jugador?.puntos ?? calculado);
    return { puntos, triples, dobles, libres };
  };

  const obtenerValorEstadistica = (jugador, clave) => {
    if (clave === "puntos") {
      return obtenerPuntosJugador(jugador).puntos;
    }
    return Number(jugador?.[clave]) || 0;
  };

  const obtenerTopJugadores = (lista, clave, limite = 3) => {
    if (!lista || lista.length === 0) return [];
    return [...lista]
      .sort((a, b) => obtenerValorEstadistica(b, clave) - obtenerValorEstadistica(a, clave))
      .slice(0, limite);
  };

  const obtenerDesglosePuntos = (lista) => {
    return lista.reduce(
      (acc, jugador) => {
        const { puntos, triples, dobles, libres } = obtenerPuntosJugador(jugador);
        acc.triples += triples;
        acc.dobles += dobles;
        acc.libres += libres;
        acc.total += puntos;
        return acc;
      },
      { triples: 0, dobles: 0, libres: 0, total: 0 }
    );
  };
  
  // Promedios simples para el dashboard
  const calcularPromedio = (lista, clave) => {
    if (!lista || lista.length === 0) return 0;
    const total = lista.reduce((acc, item) => acc + (item?.[clave] || 0), 0);
    return total / lista.length;
  };

  const sumarCampo = (lista, clave) =>
    lista.reduce((acc, j) => acc + (Number(j?.[clave]) || 0), 0);

  const calcularTotales = (lista) => {
    if (!lista || lista.length === 0) {
      return {
        totalJugadores: 0,
        presentes: 0,
        ausentes: 0,
        puntos: 0,
        rebotes: 0,
        asistencias: 0,
        robos: 0,
        bloqueos: 0,
        triples: 0,
        dobles: 0,
        tiros_libres: 0,
      };
    }

    const presentes = lista.filter((j) => j.presente);
    return {
      totalJugadores: lista.length,
      presentes: presentes.length,
      ausentes: lista.length - presentes.length,
      puntos: sumarCampo(lista, "puntos"),
      rebotes: sumarCampo(lista, "rebotes"),
      asistencias: sumarCampo(lista, "asistencias"),
      robos: sumarCampo(lista, "robos"),
      bloqueos: sumarCampo(lista, "bloqueos"),
      triples: sumarCampo(lista, "triples"),
      dobles: sumarCampo(lista, "dobles"),
      tiros_libres: sumarCampo(lista, "tiros_libres") + sumarCampo(lista, "tirosLibres"),
    };
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

  const asistenciaPorcentaje = totalesEquipo
    ? Math.min(
        100,
        Math.round(
          (totalesEquipo.presentes / Math.max(totalesEquipo.totalJugadores || 1, 1)) * 100
        )
      )
    : 0;
  const desglosePuntos = obtenerDesglosePuntos(jugadoresPresentes);
  const totalPuntosEquipo = desglosePuntos.total;
  const totalRebotesEquipo = sumarEstadistica(jugadoresPresentes, "rebotes");
  const totalAsistenciasEquipo = sumarEstadistica(jugadoresPresentes, "asistencias");
  const totalRobosEquipo = sumarEstadistica(jugadoresPresentes, "robos");
  const totalBloqueosEquipo = sumarEstadistica(jugadoresPresentes, "bloqueos");
  const totalImpacto =
    totalPuntosEquipo +
    totalAsistenciasEquipo +
    totalRebotesEquipo +
    totalRobosEquipo +
    totalBloqueosEquipo;

  // Referencias simples para rellenar barras en función de los jugadores presentes
  const baseJugadores = Math.max(totalesEquipo?.presentes || 1, 1);
  const maxPuntosEstimados = baseJugadores * 25; // 25 pts por jugador
  const maxRebotesEstimados = baseJugadores * 12;
  const maxAsistenciasEstimadas = baseJugadores * 10;
  const maxImpactoEstimado = baseJugadores * 50;
  const topStats = [
    { key: "puntos", label: "Puntos", color: "text-yellow-300", bg: "bg-yellow-500/10" },
    { key: "rebotes", label: "Rebotes", color: "text-blue-300", bg: "bg-blue-500/10" },
    { key: "asistencias", label: "Asistencias", color: "text-purple-300", bg: "bg-purple-500/10" },
    { key: "robos", label: "Robos", color: "text-emerald-300", bg: "bg-emerald-500/10" },
    { key: "bloqueos", label: "Bloqueos", color: "text-red-300", bg: "bg-red-500/10" }
  ];
  const distribucionPuestos = jugadoresPresentes.reduce((acc, jugador) => {
    if (jugador.puesto) {
      acc[jugador.puesto] = (acc[jugador.puesto] || 0) + 1;
    }
    return acc;
  }, {});
  const jugadorDestacado = jugadoresPresentes.reduce((mejor, jugador) => {
    const impacto =
      (jugador.puntos || 0) * 2 +
      (jugador.rebotes || 0) +
      (jugador.asistencias || 0) +
      (jugador.robos || 0) +
      (jugador.bloqueos || 0);
    if (!mejor || impacto > mejor.impacto) {
      return { ...jugador, impacto };
    }
    return mejor;
  }, null);

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

              {/* DASHBOARD RÁPIDO */}
              {totalesEquipo && totalesEquipo.totalJugadores > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Dashboard</p>
                      <h3 className="text-3xl font-bold">Pulso del evento</h3>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Datos en vivo
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700 rounded-2xl p-6 shadow-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                          <p className="text-xs uppercase text-gray-400">Asistencia</p>
                          <p className="text-4xl font-black text-yellow-400">{asistenciaPorcentaje}%</p>
                          <p className="text-xs text-gray-500">
                            {totalesEquipo.presentes} presentes / {totalesEquipo.totalJugadores} convocados
                          </p>
                          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-yellow-400"
                              style={{ width: `${asistenciaPorcentaje}%` }}
                            ></div>
                          </div>
                        </div>

                        <div
                          className="relative p-4 bg-black/40 rounded-xl border border-white/5"
                          onMouseEnter={() => setMenuPuntosAbierto(true)}
                          onMouseLeave={() => setMenuPuntosAbierto(false)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs uppercase text-gray-400">Puntos equipo</p>
                              <p className="text-4xl font-black text-white flex items-center gap-2">
                                {totalPuntosEquipo}
                                <span className="text-xs text-gray-400 px-2 py-1 rounded-full bg-gray-800 border border-white/5">
                                  Desglose
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">Total acumulado (presentes)</p>
                            </div>
                            <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              Hover
                            </div>
                          </div>
                          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                              style={{
                                width: `${Math.min(100, (totalPuntosEquipo / maxPuntosEstimados) * 100)}%`
                              }}
                            ></div>
                          </div>

                          {menuPuntosAbierto && (
                            <div className="absolute z-20 top-full right-0 mt-2 w-72 bg-[#0f0f0f] border border-gray-700 rounded-xl shadow-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-white">Desglose de puntos</p>
                                <span className="text-[11px] text-gray-500">Interactivo</span>
                              </div>
                              <div className="space-y-2">
                                {[
                                  { label: "Triples (3 pts)", valor: desglosePuntos.triples, puntos: desglosePuntos.triples * 3, color: "from-cyan-400 to-blue-500" },
                                  { label: "Dobles (2 pts)", valor: desglosePuntos.dobles, puntos: desglosePuntos.dobles * 2, color: "from-amber-400 to-orange-500" },
                                  { label: "Tiro libre (1 pt)", valor: desglosePuntos.libres, puntos: desglosePuntos.libres, color: "from-emerald-400 to-green-500" }
                                ].map((item) => (
                                  <div key={item.label}>
                                    <div className="flex items-center justify-between text-xs text-gray-300">
                                      <span>{item.label}</span>
                                      <span className="font-semibold text-yellow-200">{item.puntos} pts</span>
                                    </div>
                                    <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full bg-gradient-to-r ${item.color}`}
                                        style={{
                                          width: `${desglosePuntos.total ? Math.min(100, (item.puntos / Math.max(desglosePuntos.total, 1)) * 100) : 0}%`
                                        }}
                                      ></div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                      {item.valor} lanzamientos
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-3">
                                Se usa el total de puntos reportado por jugador; si no lo hay, se calcula con triples, dobles y libres.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                          <p className="text-xs uppercase text-gray-400">Rebotes</p>
                          <p className="text-4xl font-black text-white">{totalRebotesEquipo}</p>
                          <p className="text-xs text-gray-500">Total acumulado (presentes)</p>
                          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-300"
                              style={{
                                width: `${Math.min(100, (totalRebotesEquipo / maxRebotesEstimados) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                          <p className="text-xs uppercase text-gray-400">Asistencias</p>
                          <p className="text-4xl font-black text-white">{totalAsistenciasEquipo}</p>
                          <p className="text-xs text-gray-500">Total acumulado (presentes)</p>
                          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-400"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (totalAsistenciasEquipo / maxAsistenciasEstimadas) * 100
                                )}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* TOPES DE ESTADÍSTICAS */}
                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {topStats.map((stat) => {
                          const topJugadores = obtenerTopJugadores(jugadoresPresentes, stat.key, 3);
                          return (
                            <div
                              key={stat.key}
                              className="p-4 bg-black/30 border border-gray-800 rounded-xl shadow-inner"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-gray-300 font-semibold">
                                  Top {stat.label}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {topJugadores.length} destacados
                                </span>
                              </div>
                              {topJugadores.length > 0 ? (
                                <div className="space-y-2">
                                  {topJugadores.map((jugador, idx) => (
                                    <div
                                      key={jugador.id}
                                      className={`flex items-center justify-between p-3 rounded-lg ${stat.bg} border border-white/5`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-300">
                                          #{idx + 1}
                                        </span>
                                        <div>
                                          <p className="text-sm font-medium">
                                            {jugador.nombre} {jugador.apellidos}
                                          </p>
                                          <p className="text-xs text-gray-500 capitalize">
                                            {jugador.puesto || "Sin puesto"}
                                          </p>
                                        </div>
                                      </div>
                                      <p className={`text-lg font-bold ${stat.color}`}>
                                        {jugador[stat.key] ?? 0}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Sin datos suficientes.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* DESGLOSE DE PUNTOS POR TIPO DE LANZAMIENTO */}
                      <div className="mt-6 bg-black/30 border border-gray-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs uppercase text-gray-400">Desglose de puntos</p>
                            <h4 className="text-xl font-semibold">Triple / Doble / Tiro libre</h4>
                          </div>
                          <p className="text-sm text-gray-300">
                            Total: <span className="font-bold text-yellow-300">{desglosePuntos.total}</span> pts
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: "Triples (3 pts)", valor: desglosePuntos.triples, color: "from-cyan-400 to-blue-500", puntos: desglosePuntos.triples * 3 },
                            { label: "Dobles (2 pts)", valor: desglosePuntos.dobles, color: "from-amber-400 to-orange-500", puntos: desglosePuntos.dobles * 2 },
                            { label: "Tiro libre (1 pt)", valor: desglosePuntos.libres, color: "from-emerald-400 to-green-500", puntos: desglosePuntos.libres }
                          ].map((item) => (
                            <div key={item.label} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                              <p className="text-sm text-gray-300 font-semibold">{item.label}</p>
                              <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{item.valor}</span>
                                <span className="text-xs text-gray-500">lanzamientos</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Aportan <span className="font-semibold text-yellow-300">{item.puntos}</span> puntos
                              </p>
                              <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${item.color}`}
                                  style={{
                                    width: `${desglosePuntos.total ? Math.min(100, (item.puntos / Math.max(desglosePuntos.total, 1)) * 100) : 0}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Si algún jugador no registra sus triples/dobles/tiros libres, el valor se considera 0 para evitar errores.
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { label: "Presencia", valor: totalesEquipo.presentes, color: "from-green-500 to-emerald-400", total: totalesEquipo.totalJugadores },
                          { label: "Ausencias", valor: totalesEquipo.ausentes, color: "from-red-500 to-orange-400", total: totalesEquipo.totalJugadores },
                          { label: "Impacto total", valor: totalImpacto, color: "from-indigo-500 to-sky-400", total: maxImpactoEstimado }
                        ].map((item) => (
                          <div key={item.label} className="p-4 bg-black/30 rounded-xl border border-gray-800">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-300">{item.label}</p>
                              <span className="text-xs text-gray-500">Live</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-2xl font-bold">{item.valor}</span>
                              <span className="text-xs text-gray-500">unidades</span>
                            </div>
                            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${item.color}`}
                                style={{ width: `${Math.min(100, (item.valor / Math.max(item.total, 1)) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/50 border border-gray-800 rounded-2xl p-6 shadow-lg space-y-6">
                      <div>
                        <p className="text-xs uppercase text-gray-400">MVP del día</p>
                        {jugadorDestacado ? (
                          <div className="mt-3">
                            <p className="text-lg font-semibold text-yellow-300">
                              {jugadorDestacado.nombre} {jugadorDestacado.apellidos}
                            </p>
                            <p className="text-sm text-gray-400 capitalize">{jugadorDestacado.puesto || "Sin puesto"}</p>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div className="p-3 bg-yellow-500/10 border border-yellow-500/40 rounded-lg">
                                <p className="text-xs text-gray-400">Puntos</p>
                                <p className="text-2xl font-bold text-yellow-300">{jugadorDestacado.puntos}</p>
                              </div>
                              <div className="p-3 bg-blue-500/10 border border-blue-500/40 rounded-lg">
                                <p className="text-xs text-gray-400">Rebotes</p>
                                <p className="text-2xl font-bold text-blue-300">{jugadorDestacado.rebotes}</p>
                              </div>
                              <div className="p-3 bg-purple-500/10 border border-purple-500/40 rounded-lg">
                                <p className="text-xs text-gray-400">Asistencias</p>
                                <p className="text-2xl font-bold text-purple-300">{jugadorDestacado.asistencias}</p>
                              </div>
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-lg">
                                <p className="text-xs text-gray-400">Impacto</p>
                                <p className="text-2xl font-bold text-emerald-300">{jugadorDestacado.impacto}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 mt-3">Aún no hay jugadores presentes para destacar.</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-400">Distribución por puesto</p>
                        <div className="mt-3 space-y-2">
                          {Object.keys(distribucionPuestos).length > 0 ? (
                            Object.entries(distribucionPuestos).map(([puesto, total]) => (
                              <div key={puesto} className="flex items-center gap-3">
                                <span className="w-24 text-sm text-gray-300 capitalize truncate">{puesto}</span>
                                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (total / Math.max(totalesEquipo.presentes || 1, 1)) * 100
                                      )}%`
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 w-8 text-right">{total}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">Sin posiciones registradas.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
