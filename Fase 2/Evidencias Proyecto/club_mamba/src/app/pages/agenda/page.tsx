"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Monitor } from "lucide-react";

export default function AgendaPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [direction, setDirection] = useState(0); // Para animación: -1 atrás, 1 adelante

  // Eventos de ejemplo
  const events = {
    "2025-11-10": [
      { tipo: "Partido", descripcion: "Visita", hora: "18:00 – 20:00" },
    ],
    "2025-11-21": [
      { tipo: "Entrenamiento", descripcion: "Participante" },
    ],
  };

  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  const getDaysInMonth = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = (firstDay + 6) % 7;
    const days = [];

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return days;
  };

  const prevMonth = () => {
    if (currentDate.year === 1900 && currentDate.month === 0) return;
    setDirection(-1);
    setCurrentDate((prev) => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { ...prev, month: prev.month - 1 };
    });
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentDate.year === 2100 && currentDate.month === 11) return;
    setDirection(1);
    setCurrentDate((prev) => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { ...prev, month: prev.month + 1 };
    });
    setSelectedDay(null);
  };

  const days = getDaysInMonth(currentDate.month, currentDate.year);
  const todayDay =
    currentDate.year === today.getFullYear() &&
    currentDate.month === today.getMonth()
      ? today.getDate()
      : null;

  const selectedDateKey =
    selectedDay &&
    `${currentDate.year}-${String(currentDate.month + 1).padStart(2, "0")}-${String(
      selectedDay
    ).padStart(2, "0")}`;

  const selectedEvents = selectedDateKey ? events[selectedDateKey] : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      <main className="flex-grow px-6 py-12 max-w-6xl mx-auto w-full">
        <h1 className="text-5xl font-extrabold text-center mb-10 text-gray-100">
          AGENDA
        </h1>

        {/* Calendario */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-10 shadow-lg overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevMonth}
              className="text-yellow-400 hover:text-yellow-300 text-2xl transition-transform active:scale-90"
            >
              &lt;
            </button>
            <h2 className="text-2xl font-semibold capitalize">
              {months[currentDate.month]} {currentDate.year}
            </h2>
            <button
              onClick={nextMonth}
              className="text-yellow-400 hover:text-yellow-300 text-2xl transition-transform active:scale-90"
            >
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

          {/* Animación al cambiar de mes */}
          <div className="relative h-[260px] overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={`${currentDate.month}-${currentDate.year}`}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-7 text-center gap-y-3 text-gray-200 absolute inset-0"
              >
                {days.map((day, index) => {
  const isToday =
    day === todayDay &&
    currentDate.year === today.getFullYear() &&
    currentDate.month === today.getMonth();

  const isSelected = day === selectedDay;

  return (
    <div
      key={index}
      onClick={() => day && setSelectedDay(day)}
      className={`py-2 rounded-full transition cursor-pointer
        ${day
          ? isSelected
            ? "bg-yellow-700 text-white font-bold"
            : isToday
            ? "bg-yellow-500 text-black font-bold"
            : "hover:bg-neutral-800"
          : "cursor-default"}
      `}
    >
      {day || ""}
    </div>
  );
})}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Eventos del día seleccionado */}
        <AnimatePresence>
          {selectedEvents && (
            <motion.div
              key="eventos"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {selectedEvents.map((evento, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-xl p-5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-500 p-3 rounded-full">
                      {evento.tipo === "Entrenamiento" ? (
                        <Dumbbell className="text-black w-6 h-6" />
                      ) : (
                        <Monitor className="text-black w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {evento.tipo}
                      </h3>
                      <p className="text-gray-400">{evento.descripcion}</p>
                    </div>
                  </div>
                  {evento.hora && (
                    <div className="text-right text-gray-300 text-sm">
                      <p>{evento.hora}</p>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedEvents && selectedDay && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 mt-4"
          >
            No hay actividades para este día.
          </motion.p>
        )}
      </main>

      <Footer />
    </div>
  );
}
