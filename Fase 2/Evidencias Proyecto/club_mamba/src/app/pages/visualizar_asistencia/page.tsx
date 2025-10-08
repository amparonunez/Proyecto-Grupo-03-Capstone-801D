"use client";


import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";


export default function VisualizarAsistenciaPage() {
  const evento = {
    tipo: "Entrenamiento",
    fecha: "Lunes 14 de Octubre, 18:00",
    descripcion: "Sesión de técnica y resistencia en el gimnasio central.",
  };

  const jugadores = [
    { nombre: "Juan Paner", presente: true },
    { nombre: "Carlos Reige", presente: false },
    { nombre: "Mauricio Díaz", presente: true },
    { nombre: "Javier Contreras", presente: true },
    { nombre: "Rodrigo Acalla", presente: false },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Nav />
     <main className="min-h-screen bg-[black] text-white flex justify-center items-center py-16">
      <section className="bg-[#181818] w-[800px] rounded-2xl shadow-2xl p-10 border border-gray-800">
        {/* Encabezado del evento */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-center mb-4">
            VISUALIZAR ASISTENCIA
          </h1>

          <div className="text-center text-gray-300">
            <h2 className="text-yellow-400 text-2xl font-semibold">
              {evento.tipo}
            </h2>
            <p className="mt-1">{evento.fecha}</p>
            <p className="text-gray-400 text-sm mt-2">{evento.descripcion}</p>
          </div>
        </div>

        {/* Tabla de asistencia */}
        <div className="flex justify-between text-yellow-400 text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
          <span>Jugador</span>
          <span>Estado</span>
        </div>

        <ul className="space-y-3">
          {jugadores.map((jugador, index) => (
            <li
              key={index}
              className="flex justify-between items-center py-3 px-5 bg-[#1E1E1E] rounded-xl hover:bg-[#252525] transition"
            >
              <span className="text-white font-medium">{jugador.nombre}</span>
              <span
                className={`text-2xl ${
                  jugador.presente ? "text-green-500" : "text-red-500"
                }`}
              >
                {jugador.presente ? "✔" : "✖"}
              </span>
            </li>
          ))}
        </ul>

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
    {/* Footer */}
      <Footer />
    </div>
  );
}