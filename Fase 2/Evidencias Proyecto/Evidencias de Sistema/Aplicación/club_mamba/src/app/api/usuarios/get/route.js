import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Token faltante" }, { status: 401 });

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();
    if (userError || !user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // Obtener datos del usuario desde la tabla
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select(
        `
        nombre,
        apellidos,
        foto_perfil,
        estatura,
        peso,
        talla_uniforme,
        contacto_emergencia
      `
      )
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      nombre: data.nombre,
      apellidos: data.apellidos,
      foto_perfil: data.foto_perfil,
      estatura: data.estatura,
      peso: data.peso,
      talla_uniforme: data.talla_uniforme,
      contacto_emergencia: data.contacto_emergencia,
    });
  } catch (err) {
    console.error("Error en /api/usuarios/get:", err);
    return NextResponse.json(
      { error: "Error interno: " + err.message },
      { status: 500 }
    );
  }
}
