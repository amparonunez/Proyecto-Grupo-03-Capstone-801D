"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { CalendarDays, Dumbbell, Monitor, Trophy, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function AgendaPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar superior */}
      <Nav />

      {/* Contenido principal */}
      <main className="flex-grow px-6 py-12 max-w-6xl mx-auto w-full">

        {/* Título */}
        <h1 className="text-5xl font-extrabold text-center mb-8 tracking-wide">
          AGENDA
        </h1>

        {/* FILTROS (UI) */}
        <div className="flex justify-center gap-4 mb-10">
          {["Todos", "Entrenamientos", "Partidos", "Eventos"].map((item) => (
            <button
              key={item}
              className="
                px-5 py-2 rounded-full border border-yellow-500 text-yellow-500 
                hover:bg-yellow-500 hover:text-black transition font-semibold
              "
            >
              {item}
            </button>
          ))}
        </div>

        {/* Calendario */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-14 shadow-2xl">

          {/* Encabezado del mes */}
          <div className="flex justify-between items-center mb-6">
            <button className="text-yellow-400 hover:text-yellow-300 text-2xl">
              <ChevronLeft size={28} />
            </button>

            <h2 className="text-3xl font-bold tracking-wide">
              Noviembre 2023
            </h2>

            <button className="text-yellow-400 hover:text-yellow-300 text-2xl">
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 text-center text-yellow-400 font-semibold mb-3">
            <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-7 text-center gap-y-4 text-gray-200">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`
                  py-2 rounded-full cursor-pointer transition-all
                  ${day === 4 ? "bg-yellow-500 text-black font-bold shadow-lg scale-110" : "hover:bg-neutral-800"}
                `}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN: Próximos eventos */}
        <h2 className="text-3xl font-bold mt-4 mb-6 text-center tracking-wide">
          Próximos Eventos
        </h2>

        <div className="space-y-6">

          {/* Entrenamiento */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl hover:scale-[1.02] transition-all">
            <div className="flex items-center space-x-5">
              <div className="bg-yellow-500 p-4 rounded-full shadow-md">
                <Dumbbell className="text-black w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Entrenamiento
                  <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-semibold">
                    Próximo
                  </span>
                </h3>
                <p className="text-gray-400">Participante</p>
              </div>
            </div>

            <div className="text-right text-gray-300 text-sm">
              <p className="font-semibold text-lg">Martes 21 Nov</p>
              <p className="text-yellow-400 font-medium">18:00 – 20:00</p>
            </div>
          </div>

          {/* Partido */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl hover:scale-[1.02] transition-all">
            <div className="flex items-center space-x-5">
              <div className="bg-red-500 p-4 rounded-full shadow-md">
                <Trophy className="text-black w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Partido</h3>
                <p className="text-gray-400">Visita</p>
              </div>
            </div>

            <div className="text-right text-gray-300 text-sm">
              <p className="font-semibold text-lg">Viernes 10 Nov</p>
              <p className="text-yellow-400 font-medium">18:00</p>
            </div>
          </div>

          {/* Evento especial */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl hover:scale-[1.02] transition-all">
            <div className="flex items-center space-x-5">
              <div className="bg-blue-500 p-4 rounded-full shadow-md">
                <CalendarDays className="text-black w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Reunión General</h3>
                <p className="text-gray-400">Club – Obligatoria</p>
              </div>
            </div>

            <div className="text-right text-gray-300 text-sm">
              <p className="font-semibold text-lg">Sábado 25 Nov</p>
              <p className="text-yellow-400 font-medium">16:00 hrs</p>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
