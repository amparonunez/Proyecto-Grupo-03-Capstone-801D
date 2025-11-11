"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Nav from "@/components/ui/nav";
import Footer from "@/components/ui/footer";
import { Camera, Mail, Lock, User } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { supabase } from "@/lib/supabaseClient";

export default function EditarPerfilPage() {
  const [foto, setFoto] = useState("/img/user-avatar.png");
  const [fotoFile, setFotoFile] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  // ✅ Cargar datos del usuario logueado desde API segura
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) throw new Error("No hay sesión activa");

        const res = await fetch("/api/usuarios/get", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al obtener usuario");

        setFormData({
          nombre: data.nombre || "",
          apellido: data.apellidos || "",
          email: data.email || "",
          password: "",
        });

        // ✅ Si hay foto en la DB, usarla; si no, usar la predeterminada
        if (data.foto_perfil && data.foto_perfil.trim() !== "") {
          setFoto(data.foto_perfil);
        } else {
          setFoto("/img/user-avatar.png");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchUserData();
  }, []);

  // ✅ Manejar cambio de campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Manejar cambio de foto
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setFoto(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Guardar cambios y subir a Storage si hay nueva foto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("No hay sesión activa");

      let fotoUrl = foto;

      // 📤 Subir nueva imagen si el usuario la cambió
      if (fotoFile) {
        const ext = fotoFile.name.split(".").pop();
        const filePath = `avatars/${session.user.id}.${ext}`;

        console.log("📤 Subiendo imagen a Storage:", filePath);

        // Subir archivo (reemplaza si ya existe)
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, fotoFile, { upsert: true });

        if (uploadError) {
          console.error("Error al subir imagen:", uploadError);
          throw uploadError;
        }

        // Obtener URL pública segura
        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (!publicData?.publicUrl) {
          throw new Error("No se pudo obtener la URL pública de la imagen");
        }

        fotoUrl = publicData.publicUrl;
        console.log("✅ URL pública obtenida:", fotoUrl);
      }

      // 📡 Llamar a la API para actualizar datos
      const res = await fetch("/api/usuarios/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ...formData, fotoUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar perfil");

      alert("✅ Perfil actualizado correctamente!");
    } catch (error) {
      console.error("❌ Error al guardar perfil:", error);
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["jugador", "entrenador"]}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Nav />
        <main className="flex flex-col items-center py-16 px-6 flex-grow">
          <h1 className="text-5xl font-extrabold text-yellow-400 mb-12 text-center">
            EDITAR PERFIL
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-[#181818] w-full max-w-3xl p-10 rounded-2xl shadow-2xl border border-gray-800"
          >
            {/* FOTO */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-yellow-500">
                <Image
                  key={foto} // fuerza el refresco si cambia la URL
                  src={foto || "/img/user-avatar.png"}
                  alt="Foto de perfil"
                  width={160}
                  height={160}
                  className="object-cover"
                  priority
                  unoptimized
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

            {/* CAMPOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-yellow-400 font-semibold mb-2 block">
                  <User className="inline w-4 h-4 mr-2" /> Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-yellow-400 font-semibold mb-2 block">
                  <User className="inline w-4 h-4 mr-2" /> Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="text-yellow-400 font-semibold mb-2 block">
                <Mail className="inline w-4 h-4 mr-2" /> Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white"
              />
            </div>

            <div className="mt-6">
              <label className="text-yellow-400 font-semibold mb-2 block">
                <Lock className="inline w-4 h-4 mr-2" /> Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 bg-[#1E1E1E] border border-gray-700 rounded-lg text-white"
                placeholder="(opcional)"
              />
            </div>

            <div className="flex justify-center mt-10">
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-3 rounded-full shadow-md transition disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
