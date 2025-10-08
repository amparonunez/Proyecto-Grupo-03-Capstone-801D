"use client";


import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { useState } from "react";



export default function AsistenciaPage() {
  const [jugadores, setJugadores] = useState([
    { nombre: "Juan Paner", presente: true },
    { nombre: "Carlos Reige", presente: false },
    { nombre: "Mauricio Díaz", presente: true },
    { nombre: "Javier Contreras", presente: false },
    { nombre: "Rodrigo Acalla", presente: true },
  ]);

   const toggleAsistencia = (index) => {
    const updated = [...jugadores];
    updated[index].presente = !updated[index].presente;
    setJugadores(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Nav />

      <main className="min-h-screen bg-[black] text-white flex justify-center items-center py-20">
      <section className="bg-[#181818] w-[700px] rounded-2xl shadow-2xl p-10 border border-gray-800">
        {/* Título */}
        <h1 className="text-4xl font-bold text-center mb-10 text-white">
          REGISTRAR ASISTENCIA
        </h1>

        {/* Encabezado */}
        <div className="flex justify-between items-center text-yellow-400 text-xl font-semibold border-b border-gray-700 pb-3 mb-6">
          <span>Jugador</span>
          <span>Estado</span>
        </div>

        {/* Lista de jugadores */}
        <div className="space-y-3">
          {jugadores.map((jugador, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-[#1E1E1E] hover:bg-[#252525] transition-colors px-6 py-4 rounded-xl"
            >
              <span className="text-lg">{jugador.nombre}</span>
              <button
                onClick={() => toggleAsistencia(index)}
                className={`text-2xl font-bold ${
                  jugador.presente ? "text-green-500" : "text-red-500"
                }`}
              >
                {jugador.presente ? "✔" : "✖"}
              </button>
            </div>
          ))}
        </div>

        {/* Botón inferior */}
        <div className="flex justify-center mt-10">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-10 rounded-xl text-lg transition-all shadow-md">
            Registrar Asistencia
          </button>
        </div>
      </section>
    </main>
    {/* Footer */}
      <Footer />
    </div>
  );
}