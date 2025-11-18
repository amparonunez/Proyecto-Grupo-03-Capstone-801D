"use client";

import { Plus, Ban, Newspaper } from "lucide-react";
import Button from "@/components/ui/button";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Toast from "@/components/ui/Toast";

export default function HomePage() {
  // Carrusel imágenes
  const images = [
    "/img/3aaddf9b-8ac2-426d-be63-4ed751736afc.jpg",
    "/img/74a242f6-6f3d-4deb-8bed-02922fcf3dc2.jpeg",
    "/img/639e4c0a-3cb3-4ce9-87dd-b13372294fa3.jpg",
  ];

  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rol, setRol] = useState<string | null>(null);

  // 🔔 Toast
  const [showToast, setShowToast] = useState(true);
  const message =
    "Jugador Lucas Benavides lesionado de rodilla, fuera por 2 semanas";

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Obtener rol
  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const res = await fetch("/api/usuarios/rol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const result = await res.json();
      if (res.ok && result.rol) setRol(result.rol);
    };

    fetchUserRole();
  }, []);

  // Funciones carrusel
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

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* NAVBAR */}
      <Nav />

      {/* HERO */}
      <section className="bg-black text-center text-white py-20 px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-wide">
          Bienvenido a Mamba Club
        </h2>

        <div className="flex justify-center my-6">
          <Image
            src="/img/ball-of-basketball.svg"
            alt="Mamba Logo"
            width={70}
            height={70}
            className="yellow-filter drop-shadow-[0_0_12px_#facc15]"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {(rol === "entrenador" || rol === "jugador") && (
            <Button className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:scale-105 hover:bg-yellow-500 transition">
              <Link href="/pages/entrenamientos_partidos" className="flex items-center gap-2">
                <Ban size={18} /> Entrenamientos
              </Link>
            </Button>
          )}

          {rol === "entrenador" && (
            <Button className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:scale-105 hover:bg-yellow-500 transition">
              <Link href="/pages/asistencia" className="flex items-center gap-2">
                <Plus size={18} /> Registrar Asistencia
              </Link>
            </Button>
          )}

          <Button className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:scale-105 hover:bg-yellow-500 transition">
            <Link href="/pages/noticias" className="flex items-center gap-2">
              <Newspaper size={18} /> Ver Noticias
            </Link>
          </Button>
        </div>
      </section>

      {/* ACERCA DEL CLUB */}
      <section className="py-16 px-6 md:px-20 flex flex-col md:flex-row items-start gap-16">
        <div className="md:w-1/2">
          <h3 className="text-3xl font-bold text-black mb-6">Acerca del Club</h3>

          <p className="text-gray-700 leading-relaxed">
            El <span className="text-yellow-500 font-semibold">Mamba Club</span> 
            es un club deportivo enfocado en la formación integral de deportistas 
            en Melipilla. Contamos con espacios seguros, inclusivos y dinámicos 
            para quienes practican <strong>básquetbol</strong> y <strong>voleibol</strong>.
          </p>

          <p className="text-gray-700 mt-4 leading-relaxed">
            Promovemos valores como la disciplina, perseverancia, respeto y el trabajo en equipo.
          </p>

          <h4 className="text-xl font-bold text-black mt-10">Nuestra Misión</h4>
          <p className="text-gray-700 leading-relaxed">
            Fomentar el deporte con espacios formativos que impulsen disciplina 
            y bienestar físico y emocional.
          </p>

          <h4 className="text-xl font-bold text-black mt-10">Nuestra Visión</h4>
          <p className="text-gray-700 leading-relaxed">
            Ser un club referente regional, potenciando el talento local y el crecimiento deportivo.
          </p>
        </div>

        <div className="md:w-1/2">
          <Image
            src="/img/648a4f16-97c9-4314-92f2-3139994bd510.jpeg"
            alt="Mamba Club"
            width={500}
            height={350}
            className="rounded-3xl shadow-xl"
          />
        </div>
      </section>

      {/* VALORES */}
      <section className="py-16 px-6 md:px-20 bg-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-black mb-8">Nuestros Valores</h3>

          <div className="grid md:grid-cols-3 gap-8 text-gray-700">
            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <h4 className="text-yellow-500 font-bold mb-2">Disciplina</h4>
              <p>La constancia es clave para el crecimiento deportivo.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <h4 className="text-yellow-500 font-bold mb-2">Respeto</h4>
              <p>Promovemos un ambiente seguro y colaborativo.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
              <h4 className="text-yellow-500 font-bold mb-2">Trabajo en Equipo</h4>
              <p>Juntos logramos mejores resultados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA – CARRUSEL */}
      <section className="bg-black py-20 px-6">
        <h3 className="text-3xl md:text-4xl font-extrabold text-center text-yellow-400 mb-12 tracking-wide drop-shadow-lg">
          Galería
        </h3>

        <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(255,223,0,0.35)]">

          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {images.map((src, index) => (
              <div key={index} className="min-w-full aspect-[16/9] bg-black">
                <Image
                  src={src}
                  alt={`Slide ${index}`}
                  width={1600}
                  height={900}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Botones */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500 hover:scale-110 transition"
          >
            ‹
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-500 hover:scale-110 transition"
          >
            ›
          </button>

          {/* Indicadores */}
          <div className="flex justify-center mt-6 space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === current ? "bg-yellow-400 scale-125" : "bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* TOAST */}
      {showToast && (
        <Toast message={message} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
