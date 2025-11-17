"use client";

import { useState } from "react";
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
  // --- Eventos dinámicos ---
  const events = [
    {
      id: 1,
      tipo: "Entrenamiento",
      fecha: "Martes 21 Nov",
      hora: "18:00 – 20:00",
      descripcion: "Participante",
      icono: <Dumbbell className="text-black w-7 h-7" />,
      color: "bg-yellow-500",
      categoria: "entrenamiento",
      tag: "Próximo",
    },
    {
      id: 2,
      tipo: "Partido",
      fecha: "Viernes 10 Nov",
      hora: "18:00",
      descripcion: "Visita",
      icono: <Trophy className="text-black w-7 h-7" />,
      color: "bg-red-500",
      categoria: "partido",
    },
    {
      id: 3,
      tipo: "Reunión General",
      fecha: "Sábado 25 Nov",
      hora: "16:00 hrs",
      descripcion: "Club – Obligatoria",
      icono: <CalendarDays className="text-black w-7 h-7" />,
      color: "bg-blue-500",
      categoria: "evento",
    },
  ];

  // --- Estado de filtro ---
  const [filtro, setFiltro] = useState("todos");

  const eventosFiltrados =
    filtro === "todos"
      ? events
      : events.filter((e) => e.categoria === filtro);

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
            { nombre: "Eventos", valor: "evento" },
            { nombre: "Calendario Completo", valor: "todos" },
          ].map((btn) => (
            <button
              key={btn.valor}
              onClick={() => setFiltro(btn.valor)}
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
            <button className="text-yellow-400 hover:text-yellow-300 text-2xl">
              <ChevronLeft size={28} />
            </button>

            <h2 className="text-3xl font-bold tracking-wide">Noviembre 2023</h2>

            <button className="text-yellow-400 hover:text-yellow-300 text-2xl">
              <ChevronRight size={28} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-yellow-400 font-semibold mb-3">
            <span>L</span>
            <span>M</span>
            <span>M</span>
            <span>J</span>
            <span>V</span>
            <span>S</span>
            <span>D</span>
          </div>

          <div className="grid grid-cols-7 text-center gap-y-4 text-gray-200">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`py-2 rounded-full cursor-pointer transition-all ${
                  day === 4
                    ? "bg-yellow-500 text-black font-bold shadow-lg scale-110"
                    : "hover:bg-neutral-800"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* TÍTULO */}
        <h2 className="text-3xl font-bold mt-4 mb-6 text-center tracking-wide">
          {filtro === "todos" ? "Próximos Eventos" : "Resultados del Filtro"}
        </h2>

        {/* LISTA DE EVENTOS */}
        <div className="space-y-6">
          {eventosFiltrados.map((e) => (
            <div
              key={e.id}
              className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center space-x-5">
                <div className={`${e.color} p-4 rounded-full shadow-md`}>
                  {e.icono}
                </div>

                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    {e.tipo}
                    {e.tag && (
                      <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-semibold">
                        {e.tag}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-400">{e.descripcion}</p>
                </div>
              </div>

              <div className="text-right text-gray-300 text-sm">
                <p className="font-semibold text-lg">{e.fecha}</p>
                <p className="text-yellow-400 font-medium">{e.hora}</p>
              </div>
            </div>
          ))}

          {/* SIN RESULTADOS */}
          {eventosFiltrados.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-lg">
              No hay eventos para esta categoría.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
