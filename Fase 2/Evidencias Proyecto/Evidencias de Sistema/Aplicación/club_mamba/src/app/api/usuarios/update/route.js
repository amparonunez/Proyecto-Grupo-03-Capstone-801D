import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔑 Cliente administrativo (ignora RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { nombre, apellido, email, password, fotoUrl } = await req.json();

    // Obtener token del usuario (solo para saber quién es)
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Token faltante" }, { status: 401 });

    // Crear cliente normal con el token para obtener el usuario
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // 🧠 Actualizar datos del usuario en la tabla (con Service Role)
    const { error: updateError } = await supabaseAdmin
      .from("usuarios")
      .update({
        nombre,
        apellidos: apellido,
        ...(fotoUrl && { foto_perfil: fotoUrl }), // URL pública del Storage
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // 📧 Si el correo cambió → actualizar con correo de verificación
    if (email && email !== user.email) {
      const { error: emailError } = await supabaseUser.auth.updateUser({
        email,
      });
      if (emailError) console.error("Error al actualizar email:", emailError);
    }

    // 🔑 Si hay una nueva contraseña
    if (password && password.trim().length > 0) {
      const { error: passError } = await supabaseUser.auth.updateUser({
        password,
      });
      if (passError) console.error("Error al actualizar contraseña:", passError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error en /api/usuarios/update:", err);
    return NextResponse.json(
      { error: "Error interno del servidor: " + err.message },
      { status: 500 }
    );
  }
}
