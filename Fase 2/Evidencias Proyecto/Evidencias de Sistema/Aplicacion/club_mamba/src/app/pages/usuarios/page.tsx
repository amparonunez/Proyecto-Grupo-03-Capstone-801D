"use client";


import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/components/AuthGuard";



export default function UsuariosPage() {
    const [selectedUser, setSelectedUser] = useState(null);

    const usuarios = [
    {
      nombre: "Juan Paner",
      actividad: "Entrenamiento",
      avatar: "https://i.pravatar.cc/150?img=1",
      estadisticas: {
        asistencias: 12,
        partidosJugados: 6,
        goles: 3,
        rendimiento: "85%",
      },
    },
    {
      nombre: "Carlos Reige",
      actividad: "Partido",
      avatar: "https://i.pravatar.cc/150?img=2",
      estadisticas: {
        asistencias: 10,
        partidosJugados: 5,
        goles: 4,
        rendimiento: "78%",
      },
    },
    {
      nombre: "Mauricio Díaz",
      actividad: "No inscrito",
      avatar: "https://i.pravatar.cc/150?img=3",
      estadisticas: {
        asistencias: 0,
        partidosJugados: 0,
        goles: 0,
        rendimiento: "—",
      },
    },
    {
      nombre: "Rodrigo Acalla",
      actividad: "Entrenamiento",
      avatar: "https://i.pravatar.cc/150?img=4",
      estadisticas: {
        asistencias: 15,
        partidosJugados: 7,
        goles: 6,
        rendimiento: "91%",
      },
    },
  ];

  return (
    <AuthGuard allowedRoles={["entrenador"]}>
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Nav />

      <main className="min-h-screen bg-[black] text-white flex flex-col items-center py-16">
        <h1 className="text-5xl font-bold text-center mb-12 text-white">
          USUARIOS REGISTRADOS
        </h1>
      <section className="bg-[#181818] w-[900px] rounded-2xl shadow-2xl p-10 border border-gray-800">
        {/* Título */}
        

        {/* Encabezado */}
        <div className="flex justify-between text-yellow-400 text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
          <span>Usuario</span>
          <span>Actividad</span>
        </div>

        {/* Lista de usuarios */}
        <ul className="space-y-3">
          {usuarios.map((usuario, index) => (
            <li
              key={index}
              onClick={() => setSelectedUser(usuario)}
              className="flex justify-between items-center py-3 px-5 bg-[#1E1E1E] rounded-xl hover:bg-[#252525] transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <img
                  src={usuario.avatar}
                  alt={usuario.nombre}
                  className="w-12 h-12 rounded-full object-cover border border-gray-700"
                />
                <span className="text-white font-medium">{usuario.nombre}</span>
              </div>
              <span
                className={`${
                  usuario.actividad === "No inscrito"
                    ? "text-gray-500"
                    : "text-yellow-400"
                }`}
              >
                {usuario.actividad}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Modal animado */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="bg-[#181818] w-[500px] p-8 rounded-2xl border border-gray-700 shadow-2xl relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-5 text-gray-400 hover:text-yellow-400 text-2xl"
              >
                ✖
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.nombre}
                  className="w-28 h-28 rounded-full object-cover border-2 border-yellow-400 shadow-lg mb-4"
                />
                <h2 className="text-3xl font-bold text-yellow-400">
                  {selectedUser.nombre}
                </h2>
              </div>

              {/* Datos */}
              <div className="text-gray-300 space-y-2 mb-6">
                <p>
                  <span className="font-semibold text-white">Actividad: </span>
                  {selectedUser.actividad}
                </p>
                <p>
                  <span className="font-semibold text-white">Asistencias: </span>
                  {selectedUser.estadisticas.asistencias}
                </p>
                <p>
                  <span className="font-semibold text-white">
                    Partidos jugados:{" "}
                  </span>
                  {selectedUser.estadisticas.partidosJugados}
                </p>
                <p>
                  <span className="font-semibold text-white">Goles: </span>
                  {selectedUser.estadisticas.goles}
                </p>
                <p>
                  <span className="font-semibold text-white">Rendimiento: </span>
                  {selectedUser.estadisticas.rendimiento}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg text-lg transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    {/* Footer */}
      <Footer />
    </div>
    </AuthGuard>
  );
}