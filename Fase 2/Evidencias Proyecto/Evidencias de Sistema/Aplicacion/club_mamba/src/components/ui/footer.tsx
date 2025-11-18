"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10 px-6 mt-1">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Información del club */}
        <div>
          <h4 className="text-yellow-400 font-bold text-lg mb-2">MAMBA CLUB</h4>
          <p className="text-gray-400 text-sm">
            Club deportivo de básquetbol y voleibol en Melipilla.  
            Fomentamos el deporte, la disciplina y el trabajo en equipo.
          </p>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-yellow-400 font-bold text-lg mb-2">Contacto</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>📍 Melipilla, Chile</li>
            <li>📧 contacto@mambaclub.cl</li>
            <li>📞 +56 9 1234 5678</li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div>
          <h4 className="text-yellow-400 font-bold text-lg mb-2">Síguenos</h4>
          <div className="flex gap-4">
            <a href="#" className="hover:text-yellow-400 transition">
              <Facebook size={22} />
            </a>
            <a href="#" className="hover:text-yellow-400 transition">
              <Instagram size={22} />
            </a>
            <a href="#" className="hover:text-yellow-400 transition">
              <Twitter size={22} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-500 text-xs mt-10 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} MAMBA CLUB - Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
