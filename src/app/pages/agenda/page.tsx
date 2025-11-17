"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { CalendarDays, Dumbbell, Monitor } from "lucide-react";

export default function AgendaPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar superior */}
      <Nav />

      {/* Contenido principal */}
      <main className="flex-grow px-6 py-12 max-w-6xl mx-auto w-full">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-gray-100">
          AGENDA
        </h1>

        {/* Calendario */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-10 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <button className="text-yellow-400 hover:text-yellow-300 text-2xl">
              &lt;
            </button>
            <h2 className="text-2xl font-semibold">noviembre 2023</h2>
            <button className="text-yellow-400 hover:text-yellow-300 text-2xl">
              &gt;
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 text-center text-yellow-400 font-semibold mb-4">
            <span>L</span>
            <span>M</span>
            <span>M</span>
            <span>J</span>
            <span>V</span>
            <span>S</span>
            <span>D</span>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-7 text-center gap-y-3 text-gray-200">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`py-2 rounded-full ${
                  day === 4
                    ? "bg-yellow-500 text-black font-bold"
                    : "hover:bg-neutral-800"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Eventos */}
        <div className="space-y-6">
          {/* Entrenamiento */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 p-3 rounded-full">
                <Dumbbell className="text-black w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Entrenamiento</h3>
                <p className="text-gray-400">Participante</p>
              </div>
            </div>
            <div className="text-right text-gray-300 text-sm">
              <p>Martes 21 de noviembre</p>
            </div>
          </div>

          {/* Partido */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 p-3 rounded-full">
                <Monitor className="text-black w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Partido</h3>
                <p className="text-gray-400">Visita</p>
              </div>
            </div>
            <div className="text-right text-gray-300 text-sm">
              <p>Viernes 10 de noviembre</p>
              <p>18:00 – 20:00</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
