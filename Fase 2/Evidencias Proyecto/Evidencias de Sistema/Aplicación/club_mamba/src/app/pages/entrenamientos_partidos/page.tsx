"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { Calendar, MapPin, Dumbbell, Trophy, User } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/components/AuthGuard";

export default function EntrenamientosPage() {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [rol, setRol] = useState(null);
  const [userId, setUserId] = useState(null);
  const [, setCargando] = useState(true);

  // 🧩 Cargar usuario y rol
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("No hay usuario logueado");
        setCargando(false);
        return;
      }

      setUserId(user.id);

      const res = await fetch("/api/usuarios/rol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const result = await res.json();

      if (res.ok && result.rol) {
        setRol(result.rol);
      } else {
        console.error(result.error);
      }

      setCargando(false);
    };

    fetchUserData();
  }, []);

  // 📅 Cargar eventos desde la API
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch("/api/eventos/ver_eventos");
        const data = await res.json();
        if (res.ok) setEventos(data);
        else console.error(data.error);
      } catch (err) {
        console.error("Error al obtener eventos:", err);
      }
    };
    fetchEventos();
  }, []);

  // 🟡 Función para inscribirse
  const handleInscribirse = async (eventoId) => {
    if (!userId) return alert("Debes iniciar sesión.");

    try {
      const res = await fetch("/api/eventos/inscribir_evento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: userId,
          evento_id: eventoId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error al inscribirse:", error);
      alert("Error al intentar inscribirte.");
    }
  };

  return (
    <AuthGuard allowedRoles={["entrenador", "jugador"]}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Nav />

        <main className="flex flex-col items-center py-16 flex-grow">
          <h1 className="text-5xl font-bold text-center mb-12 text-white">
            ENTRENAMIENTOS Y PARTIDOS
          </h1>

          <section className="w-[1000px] bg-[#181818] rounded-2xl shadow-2xl p-10 border border-gray-800">
            {eventos.length === 0 ? (
              <p className="text-gray-400 text-center">
                No hay eventos disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-8">
                {eventos.map((evento) => {
                  const fechaHora = new Date(`${evento.fecha}T${evento.hora}`);

                  // Mostrar nombre completo (nombre + apellido)
                  const nombreCompleto =
                    evento.usuarios?.nombre && evento.usuarios?.apellidos
                      ? `${evento.usuarios.nombre} ${evento.usuarios.apellidos}`
                      : evento.usuarios?.nombre
                      ? evento.usuarios.nombre
                      : evento.usuarios?.apellidos
                      ? evento.usuarios.apellidos
                      : evento.usuarios?.email?.split("@")[0] || "Entrenador";

                  return (
                    <div
                      key={evento.id}
                      onClick={() => setEventoSeleccionado(evento)}
                      className="bg-[#1E1E1E] p-6 rounded-2xl border border-gray-700 hover:border-yellow-400 transition-all cursor-pointer hover:scale-105"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {evento.tipo === "Partido" ? (
                          <Trophy className="w-8 h-8 text-yellow-400" />
                        ) : (
                          <Dumbbell className="w-8 h-8 text-yellow-400" />
                        )}
                        <h2 className="text-2xl font-semibold text-yellow-400">
                          {evento.tipo}
                        </h2>
                      </div>
                      <p className="text-gray-300 flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />{" "}
                        {fechaHora.toLocaleString("es-CL", {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="text-gray-400 text-sm mb-1">
                        {evento.lugar}
                      </p>

                      {/* 🔥 NUEVO: Mostrar entrenador con nombre completo */}
                      <div className="mt-4 pt-3 border-t border-gray-700">
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <User className="w-3 h-3" />
                          Organizado por:{" "}
                          <span className="text-yellow-400 font-medium">
                            {nombreCompleto}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex justify-center mt-10">
            {rol === "entrenador" && (
              <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-yellow-400 transition">
                <Link href="/pages/crear_partido_entrenamiento">
                  Agregar evento
                </Link>
              </button>
            )}
          </div>
        </main>

        <Footer />

        {/* Modal */}
        {eventoSeleccionado && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-50 animate-fadeIn"
            onClick={() => setEventoSeleccionado(null)}
          >
            <div
              className="bg-[#1E1E1E] p-8 rounded-2xl shadow-xl border border-yellow-400 w-[400px] text-center animate-modalOpen"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                {eventoSeleccionado.tipo === "Partido" ? (
                  <Trophy className="w-10 h-10 text-yellow-400" />
                ) : (
                  <Dumbbell className="w-10 h-10 text-yellow-400" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                {eventoSeleccionado.tipo}
              </h2>
              <p className="text-gray-300 flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />{" "}
                {new Date(`${eventoSeleccionado.fecha}T${eventoSeleccionado.hora}`).toLocaleString("es-CL", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
              <p className="text-gray-300 flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-4 h-4" /> {eventoSeleccionado.lugar}
              </p>

              {/* Entrenador en el modal con nombre completo */}
              <p className="text-gray-400 flex items-center justify-center gap-2 mb-4">
                <User className="w-4 h-4" />
                Organizado por:{" "}
                <span className="text-yellow-400 font-medium">
                  {eventoSeleccionado.usuarios?.nombre &&
                  eventoSeleccionado.usuarios?.apellidos
                    ? `${eventoSeleccionado.usuarios.nombre} ${eventoSeleccionado.usuarios.apellidos}`
                    : eventoSeleccionado.usuarios?.nombre
                    ? eventoSeleccionado.usuarios.nombre
                    : eventoSeleccionado.usuarios?.apellidos
                    ? eventoSeleccionado.usuarios.apellidos
                    : eventoSeleccionado.usuarios?.email?.split("@")[0] ||
                      "Entrenador"}
                </span>
              </p>

              <p className="text-gray-400 mb-6">
                {eventoSeleccionado.descripcion}
              </p>

              {rol === "jugador" && (
                <button
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg shadow-md transition"
                  onClick={() => handleInscribirse(eventoSeleccionado.id)}
                >
                  Inscribirse
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalOpen {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-modalOpen {
          animation: modalOpen 0.35s ease-out;
        }
      `}</style>
    </AuthGuard>
  );
}
