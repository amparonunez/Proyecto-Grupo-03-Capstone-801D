"use client";

import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";

export default function VisualizarAsistenciaPage() {
  const evento = {
    tipo: "Entrenamiento",
    fecha: "Lunes 14 de Octubre, 18:00",
    descripcion: "Sesión de técnica y resistencia en el gimnasio central.",
    tiempo: 3600, // en segundos (ej: 1 hora)
  };

  const jugadores = [
    { nombre: "Juan Paner", presente: true, puntos: 10, rebotes: 5, asistencias: 7, robos: 2, bloqueos: 1 },
    { nombre: "Carlos Reige", presente: false, puntos: 0, rebotes: 0, asistencias: 0, robos: 0, bloqueos: 0 },
    { nombre: "Mauricio Díaz", presente: true, puntos: 8, rebotes: 4, asistencias: 3, robos: 1, bloqueos: 0 },
    { nombre: "Javier Contreras", presente: true, puntos: 12, rebotes: 6, asistencias: 5, robos: 3, bloqueos: 2 },
    { nombre: "Rodrigo Acalla", presente: false, puntos: 0, rebotes: 0, asistencias: 0, robos: 0, bloqueos: 0 },
  ];

  // Función para formatear tiempo
  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(minutos).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />
      <main className="min-h-screen bg-[black] text-white flex justify-center items-center py-16">
        <section className="bg-[#181818] w-[900px] rounded-2xl shadow-2xl p-10 border border-gray-800">
          {/* Encabezado del evento */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">VISUALIZAR ASISTENCIA</h1>
            <h2 className="text-yellow-400 text-2xl font-semibold">{evento.tipo}</h2>
            <p className="mt-1">{evento.fecha}</p>
            <p className="text-gray-400 text-sm mt-2">{evento.descripcion}</p>
            <p className="mt-2 text-lg text-gray-300">
              Duración: <span className="text-yellow-400">{formatearTiempo(evento.tiempo)}</span>
            </p>
          </div>

          {/* Tabla de asistencia y estadísticas */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="text-yellow-400 border-b border-gray-600">
                  <th className="py-3">Jugador</th>
                  <th>Presente</th>
                  <th>Puntos</th>
                  <th>Rebotes</th>
                  <th>Asistencias</th>
                  <th>Robos</th>
                  <th>Bloqueos</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((jugador, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-[#252525] transition">
                    <td className="py-3 font-medium">{jugador.nombre}</td>
                    <td className={`text-2xl ${jugador.presente ? "text-green-500" : "text-red-500"}`}>
                      {jugador.presente ? "✔" : "✖"}
                    </td>
                    <td>{jugador.puntos}</td>
                    <td>{jugador.rebotes}</td>
                    <td>{jugador.asistencias}</td>
                    <td>{jugador.robos}</td>
                    <td>{jugador.bloqueos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botón inferior */}
          <div className="flex justify-center mt-10">
            <button
              onClick={() => history.back()}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-10 rounded-xl text-lg transition-all shadow-md"
            >
              Volver
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
