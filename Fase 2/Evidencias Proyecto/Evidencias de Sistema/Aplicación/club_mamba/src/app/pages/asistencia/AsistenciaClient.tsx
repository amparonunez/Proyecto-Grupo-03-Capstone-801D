"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/components/AuthGuard";
import { useSearchParams } from "next/navigation";

export default function AsistenciaClient() {
  const [rol, setRol] = useState(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const searchParams = useSearchParams();

  // Obtener usuario y rol
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setMensaje("❌ Error: Usuario no autenticado");
          setLoading(false);
          return;
        }

        setUsuarioId(user.id);

        const res = await fetch("/api/usuarios/rol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id }),
        });

        const result = await res.json();
        if (res.ok && result.rol) {
          setRol(result.rol);
        } else {
          setMensaje("❌ Error al obtener el rol del usuario");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
        setMensaje("❌ Error de conexión");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Obtener eventos
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        if (!rol || !usuarioId) return;

        setLoading(true);

        const url = `/api/asistencia/ver_asistencia?usuario_id=${usuarioId}&rol=${rol}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          setMensaje("❌ Error al obtener eventos: " + (data.error || "Error desconocido"));
          setEventos([]);
          return;
        }

        if (!data.eventos || data.eventos.length === 0) {
          setMensaje("⚠️ " + (data.message || "No hay eventos disponibles actualmente."));
          setEventos([]);
        } else {
          setEventos(data.eventos);
          setMensaje("");
        }
      } catch (error) {
        console.error("Error fetching eventos:", error);
        setMensaje("❌ Error de conexión con el servidor.");
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };

    if (rol && usuarioId) {
      fetchEventos();
    }
  }, [rol, usuarioId]);

  const formatearFechaHora = (fecha: string, hora: string) => {
    try {
      const fechaHora = new Date(`${fecha}T${hora}`);

      const opcionesFecha: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };

      const fechaFormateada = fechaHora.toLocaleDateString("es-CL", opcionesFecha);
      const horaFormateada = fechaHora.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        fecha: fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1),
        hora: horaFormateada,
      };
    } catch (error) {
      return { fecha: "Fecha no disponible", hora: "Hora no disponible" };
    }
  };

  return (
    <AuthGuard allowedRoles={["entrenador", "jugador"]}>
      <div className="min-h-screen bg-gray-100">
        <Nav />

        <main className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 md:mb-12 text-white">ASISTENCIA</h1>

          <section className="w-full max-w-5xl bg-[#181818] rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-800">
            {loading ? (
              <div className="text-center">
                <p className="text-gray-400 mb-2">Cargando eventos...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
              </div>
            ) : mensaje ? (
              <p
                className={`text-center font-semibold ${
                  mensaje.includes("❌")
                    ? "text-red-400"
                    : mensaje.includes("⚠️")
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {mensaje}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventos.map((evento) => {
                  const { fecha, hora } = formatearFechaHora(evento.fecha, evento.hora);

                  return (
                    <div
                      key={evento.id}
                      className="bg-[#1E1E1E] p-6 rounded-2xl border border-gray-700 hover:border-yellow-400 transition-colors duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-2xl font-semibold text-yellow-400 capitalize">
                          {evento.tipo}
                        </h2>
                        <div className="flex flex-col items-end gap-1">
                          <span className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full capitalize">
                            {evento.tipo}
                          </span>
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                            {evento.jugadores_inscritos} jugadores
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-gray-300">📅 {fecha}</p>
                        <p className="text-gray-300">⏰ {hora}</p>
                        {evento.lugar && <p className="text-gray-400">📍 {evento.lugar}</p>}
                      </div>

                      {evento.descripcion && (
                        <p className="text-gray-400 text-sm mb-6 border-l-4 border-yellow-400 pl-3 py-1">
                          {evento.descripcion}
                        </p>
                      )}

                      <div className="flex flex-col gap-3 md:flex-row md:gap-0 justify-between items-center pt-4 border-t border-gray-700">
                        {rol === "entrenador" && (
                          <Link
                            href={`/pages/registrar_asistencia?id=${evento.id}`}
                            className="w-full md:flex-1 md:mr-2"
                          >
                            <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">
                              Registrar Asistencia
                            </button>
                          </Link>
                        )}

                        <Link
                          href={`/pages/visualizar_asistencia?id=${evento.id}`}
                          className={
                            rol === "entrenador"
                              ? "w-full md:flex-1 md:ml-2"
                              : "w-full md:flex-1"
                          }
                        >
                          <button className="w-full bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-semibold py-2 px-4 rounded-lg transition duration-300">
                            Ver Asistencia
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
