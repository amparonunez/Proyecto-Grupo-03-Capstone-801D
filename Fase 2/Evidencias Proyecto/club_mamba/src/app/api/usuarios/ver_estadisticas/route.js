import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente administrador (ignora RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del usuario." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("estadisticas")
      .select("id, usuario_id, evento_id, puntos, rebotes, asistencias, robos, bloqueos, created_at")
      .eq("usuario_id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Estadísticas obtenidas correctamente",
      data,
    });
  } catch (err) {
    console.error("Error en API ver_estadisticas:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
