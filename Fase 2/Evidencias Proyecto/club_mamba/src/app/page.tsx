"use client";

import { Plus, Ban, Newspaper } from "lucide-react";
import Button from "@/components/ui/button";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HomePage() {
  // Estado para el carrusel
  const images = [
    "/img/3aaddf9b-8ac2-426d-be63-4ed751736afc.jpg",
    "/img/74a242f6-6f3d-4deb-8bed-02922fcf3dc2.jpeg",
    "/img/639e4c0a-3cb3-4ce9-87dd-b13372294fa3.jpg",
  ];
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Nav />

      {/* Hero Section */}
      <section className="bg-black text-center text-white py-20 px-6">
        <h2 className="text-3xl md:text-5xl font-bold">
          Bienvenido a Mamba Club
        </h2>

        {/* Icono de basket */}
        <div className="flex justify-center my-6">
          <Image
            src="/img/ball-of-basketball.svg"
            alt="Mamba Logo"
            width={50}
            height={50}
            className="yellow-filter"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Button className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-yellow-500 transition">
            <Ban size={18} /> Entrenamientos
          </Button>

          <Button className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-yellow-500 transition">
            <Plus size={18} /> Registrar Asistencia
          </Button>

          <Button className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition">
            <Newspaper size={18} />
            Ver Noticias
          </Button>
        </div>
      </section>

      {/* Acerca del Club */}
      <section className="py-16 px-6 md:px-20 text-center md:text-left flex flex-col md:flex-row items-center gap-100">
        <div className="md:w-1/2">
          <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
            Acerca del Club
          </h3>
          <p className="text-gray-700 leading-relaxed">
            El <span className="text-yellow-500 font-semibold">Mamba Club</span>{" "}
            es un club deportivo fundado para fomentar la pasión por el{" "}
            <strong>básquetbol</strong> y el <strong>voleibol</strong> en la
            comunidad de Melipilla. Nuestro objetivo es formar deportistas con
            disciplina, respeto y trabajo en equipo, ofreciendo entrenamientos
            de calidad para niños, jóvenes y adultos.
          </p>
          <p className="text-gray-700 mt-4">
            Participamos en campeonatos locales y regionales, promoviendo el
            deporte como herramienta de integración y desarrollo personal.
          </p>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/img/648a4f16-97c9-4314-92f2-3139994bd510.jpeg"
            alt="Mamba Club"
            width={400}
            height={200}
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Carrusel */}
      <section className="bg-black py-16 px-6">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-yellow-400 mb-8">
          Galería
        </h3>

        <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-2xl shadow-lg">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${current * 100}%)`,
              width: `${images.length * 33.6}%`
            }}
          >
            {images.map((src, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <Image
                  src={src}
                  alt={`Slide ${index}`}
                  width={800}
                  height={500}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            ))}
          </div>

          {/* Controles */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500 transition"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-500 transition"
          >
            ›
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full ${
                  index === current ? "bg-yellow-400" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
