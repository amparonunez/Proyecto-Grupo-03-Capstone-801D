"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import {
  CalendarDays,
  Dumbbell,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AgendaPage() {
  const [eventsBD, setEventsBD] = useState([]); // eventos reales de BD
  const [loading, setLoading] = useState(true);

  // ==========================
  // Cargar eventos desde la API
  // ==========================
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/eventos/agenda_eventos");
        const data = await res.json();
        setEventsBD(data);
      } catch (err) {
        console.error("Error cargando eventos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // ==========================
  //   CALENDARIO
  // ==========================
  const hoy = new Date();

  const [fecha, setFecha] = useState({
    mes: hoy.getMonth(),
    año: hoy.getFullYear(),
  });

  const { mes, año } = fecha;

  const nombresMes = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  const nombresDias = [
    "Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado",
  ];

  const cambiarMes = (direccion) => {
    setFecha((prev) => {
      let nuevoMes = prev.mes + direccion;
      let nuevoAño = prev.año;

      if (nuevoMes < 0) {
        nuevoMes = 11;
        nuevoAño -= 1;
      } else if (nuevoMes > 11) {
        nuevoMes = 0;
        nuevoAño += 1;
      }

      return { mes: nuevoMes, año: nuevoAño };
    });
  };

  const primerDiaSemana = new Date(año, mes, 1).getDay() || 7;
  const diasEnMes = new Date(año, mes + 1, 0).getDate();

  const hoyDia = hoy.getDate();
  const esMesActual = hoy.getMonth() === mes && hoy.getFullYear() === año;

  // ==========================
  //   FECHA SELECCIONADA
  // ==========================
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  // Formatear fecha como "Martes 21 Nov"
  const formatearFecha = (day) => {
    const fechaReal = new Date(año, mes, day);
    const nombreDia = nombresDias[fechaReal.getDay()];
    const nombreMes = nombresMes[mes].slice(0, 3);
    return `${nombreDia} ${day} ${nombreMes}`;
  };

  // ==========================
  //   FILTROS
  // ==========================
  const [filtro, setFiltro] = useState("todos");

  const eventosFiltrados = eventsBD.filter((e) => {
    if (filtro !== "todos" && e.categoria !== filtro) return false;
    if (fechaSeleccionada && e.fecha !== fechaSeleccionada) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      <main className="flex-grow px-6 py-12 max-w-6xl mx-auto w-full">
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">
          AGENDA
        </h1>

        {/* FILTROS */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { nombre: "Todos", valor: "todos" },
            { nombre: "Entrenamientos", valor: "entrenamiento" },
            { nombre: "Partidos", valor: "partido" },
          ].map((btn) => (
            <button
              key={btn.valor}
              onClick={() => {
                setFiltro(btn.valor);
                setFechaSeleccionada(null);
              }}
              className={`px-5 py-2 rounded-full border font-semibold transition
                ${
                  filtro === btn.valor
                    ? "bg-yellow-500 text-black border-yellow-500"
                    : "border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                }`}
            >
              {btn.nombre}
            </button>
          ))}
        </div>

        {/* CALENDARIO */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-14 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => cambiarMes(-1)}
              className="text-yellow-400 hover:text-yellow-300 text-2xl"
            >
              <ChevronLeft size={28} />
            </button>

            <h2 className="text-3xl font-bold tracking-wide">
              {nombresMes[mes]} {año}
            </h2>

            <button
              onClick={() => cambiarMes(1)}
              className="text-yellow-400 hover:text-yellow-300 text-2xl"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-yellow-400 font-semibold mb-3">
            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>

          <div className="grid grid-cols-7 text-center gap-y-4 text-gray-200">
            {Array.from({ length: primerDiaSemana - 1 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((day) => {
              const fechaFormateada = formatearFecha(day);

              return (
                <div
                  key={day}
                  onClick={() => setFechaSeleccionada(fechaFormateada)}
                  className={`py-2 rounded-full cursor-pointer transition-all
                    ${
                      esMesActual && day === hoyDia
                        ? "bg-yellow-500 text-black font-bold shadow-lg scale-110"
                        : "hover:bg-neutral-800"
                    }
                    ${
                      fechaSeleccionada === fechaFormateada
                        ? "ring-2 ring-yellow-500"
                        : ""
                    }
                  `}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-4 mb-6 text-center tracking-wide">
          {fechaSeleccionada
            ? `Eventos del ${fechaSeleccionada}`
            : filtro === "todos"
            ? "Próximos Eventos"
            : "Resultados del Filtro"}
        </h2>

        {/* LISTA */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-400">Cargando eventos...</div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-lg">
              No hay eventos para esta fecha.
            </div>
          ) : (
            eventosFiltrados.map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center space-x-5">
                  <div className={`${e.color} p-4 rounded-full shadow-md`}>
                    {e.tipo === "entrenamiento" ? (
                      <Dumbbell className="text-black w-7 h-7" />
                    ) : (
                      <Trophy className="text-black w-7 h-7" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold">{e.tipo}</h3>
                    <p className="text-gray-400">{e.descripcion}</p>
                  </div>
                </div>

                <div className="text-right text-gray-300 text-sm">
                  <p className="font-semibold text-lg">{e.fecha}</p>
                  <p className="text-yellow-400 font-medium">{e.hora}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
