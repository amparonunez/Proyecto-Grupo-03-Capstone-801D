import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { usuario_id } = await req.json();

    if (!usuario_id) {
      return NextResponse.json(
        { error: "Falta el ID del usuario." },
        { status: 400 }
      );
    }

    // Buscar si está inscrito en algún evento
    const { data, error } = await supabaseAdmin
      .from("inscripciones")
      .select("id, evento_id, inscrito")
      .eq("usuario_id", usuario_id);

    if (error) throw error;

    const inscrito = data.some((item) => item.inscrito === true);

    return NextResponse.json({
      message: "Estado de inscripción obtenido correctamente",
      data: {
        inscrito,
        total_eventos: data.length,
      },
    });
  } catch (err) {
    console.error("Error en ver_inscripciones:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
