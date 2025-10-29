import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚙️ Cliente de administrador (usa la service key del backend)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ¡NO pongas esta key en el cliente!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, apellidos, rol, nivel, puesto, foto_perfil")
      .eq("rol", "jugador");

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error al obtener jugadores:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
