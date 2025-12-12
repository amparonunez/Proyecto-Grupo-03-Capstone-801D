"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { Camera, Mail, Lock, User, Ruler, Weight, Phone } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type FormData = {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  estatura: string;
  peso: string;
  talla_uniforme: string;
  contacto_de_emergencia: string;
};

export default function EditarPerfilPage() {
  const router = useRouter();
  const [foto, setFoto] = useState("/img/user-avatar.png");
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    estatura: "",
    peso: "",
    talla_uniforme: "",
    contacto_de_emergencia: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const tallaOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setError("");
        setSuccess("");
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError(userError?.message || "No se encontró el usuario.");
          setLoading(false);
          return;
        }

        setUserId(user.id);
        setFormData((prev) => ({ ...prev, email: user.email || "" }));

        const res = await fetch("/api/usuarios/datos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id }),
        });

        const result = await res.json();

        if (res.ok && result.data) {
          const perfil = result.data;
          setFormData((prev) => ({
            ...prev,
            nombre: perfil.nombre || "",
            apellidos: perfil.apellidos || "",
            estatura: perfil.estatura ? String(perfil.estatura) : "",
            peso: perfil.peso ? String(perfil.peso) : "",
            talla_uniforme: perfil.talla_uniforme || "",
            contacto_de_emergencia: perfil.contacto_de_emergencia || "",
          }));
        } else {
          setError(
            result.error || "No se pudo cargar la información del perfil."
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar el perfil."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          setFoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      setError("No se encontró el usuario.");
      return;
    }

    const actualizar = async () => {
      setSaving(true);
      setError("");
      setSuccess("");

      const estaturaValue = formData.estatura ? Number(formData.estatura) : null;
      const pesoValue = formData.peso ? Number(formData.peso) : null;

      const payload = {
        id: userId,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        estatura: Number.isFinite(estaturaValue) ? estaturaValue : null,
        peso: Number.isFinite(pesoValue) ? pesoValue : null,
        talla_uniforme: formData.talla_uniforme || null,
        contacto_de_emergencia: formData.contacto_de_emergencia || null,
      };

      const res = await fetch("/api/usuarios/actualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess("Perfil actualizado correctamente.");
        router.refresh();
      } else {
        setError(result.error || "No se pudo actualizar el perfil.");
      }
      setSaving(false);
    };

    actualizar();
  };

  return (
    <AuthGuard allowedRoles={["jugador", "entrenador"]}>
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      <main className="flex flex-col items-center py-16 px-6 flex-grow">
        <h1 className="text-5xl font-extrabold text-yellow-400 mb-12 text-center">
          EDITAR PERFIL
        </h1>

        {/* Contenedor principal */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#181818] w-full max-w-3xl p-10 rounded-2xl shadow-2xl border border-gray-800 animate-fadeIn"
        >
          {loading && (
            <p className="text-center text-neutral-400 mb-4">Cargando datos...</p>
          )}
          {error && (
            <p className="text-center text-red-400 mb-4">{error}</p>
          )}
          {success && (
            <p className="text-center text-green-400 mb-4">{success}</p>
          )}

          {/* Sección de foto */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-yellow-500">
              <Image
                src={foto}
                alt="Foto de perfil"
                width={160}
                height={160}
                className="object-cover"
              />
              <label className="absolute bottom-2 right-2 bg-yellow-500 p-2 rounded-full cursor-pointer hover:bg-yellow-400 transition">
                <Camera className="text-black w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </label>
            </div>
            <p className="text-neutral-400 text-sm mt-3">
              Haz clic en el ícono para cambiar la foto
            </p>
          </div>

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-yellow-400 font-semibold mb-2 block">
                <User className="inline w-4 h-4 mr-2" />
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-yellow-400 font-semibold mb-2 block">
                <User className="inline w-4 h-4 mr-2" />
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-yellow-400 font-semibold mb-2 block">
              <Mail className="inline w-4 h-4 mr-2" />
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
              placeholder="correo@ejemplo.com"
            />
            <p className="text-xs text-neutral-500 mt-1">
              El correo se gestiona desde la cuenta y no se actualiza aquí.
            </p>
          </div>

          <div className="mt-6">
            <label className="text-yellow-400 font-semibold mb-2 block">
              <Lock className="inline w-4 h-4 mr-2" />
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
              placeholder="Nueva contraseña"
            />
            <p className="text-xs text-neutral-500 mt-1">
              La contraseña se gestiona desde la cuenta y no se actualiza aquí.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-yellow-400 font-semibold mb-2 block">
                <Ruler className="inline w-4 h-4 mr-2" />
                Estatura (cm)
              </label>
              <input
                type="number"
                name="estatura"
                value={formData.estatura}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="Ej: 178"
                min="0"
              />
            </div>
            <div>
              <label className="text-yellow-400 font-semibold mb-2 block">
                <Weight className="inline w-4 h-4 mr-2" />
                Peso (kg)
              </label>
              <input
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="Ej: 72"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-yellow-400 font-semibold mb-2 block">
                <Ruler className="inline w-4 h-4 mr-2" />
                Talla de uniforme
              </label>
              <select
                name="talla_uniforme"
                value={formData.talla_uniforme}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition"
              >
                <option value="">Selecciona tu talla</option>
                {tallaOptions.map((option) => (
                  <option key={option} value={option}>
                    ✓ Talla {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-yellow-400 font-semibold mb-2 block">
                <Phone className="inline w-4 h-4 mr-2" />
                Contacto de emergencia
              </label>
              <input
                type="tel"
                name="contacto_de_emergencia"
                value={formData.contacto_de_emergencia}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
                placeholder="+56 9 1234 5678"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Incluye código de país y relación (ej: mamá, papá, tutor).
              </p>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-3 rounded-full shadow-md flex items-center gap-2 transition"
              disabled={saving || loading}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </main>

      <Footer />

      {/* Animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
      `}</style>
    </div>
    </AuthGuard>
  );
}
