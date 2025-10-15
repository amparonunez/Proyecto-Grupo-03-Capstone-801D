import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('id');
    
    console.log("🔍 API Evento - Verificando evento ID:", eventoId);

    if (!eventoId) {
      return NextResponse.json(
        { error: "Se requiere ID del evento" },
        { status: 400 }
      );
    }

    const eventoIdNum = parseInt(eventoId);
    if (isNaN(eventoIdNum)) {
      return NextResponse.json(
        { error: "ID de evento inválido" },
        { status: 400 }
      );
    }

    // Consultar evento
    const { data: eventos, error } = await supabase
      .from("eventos")
      .select("id, tipo, fecha, hora, lugar, descripcion, entrenador_id")
      .eq("id", eventoIdNum);

    console.log("📋 API Evento - Resultado:", { eventos, error });

    if (error) {
      return NextResponse.json(
        { error: "Error al buscar evento: " + error.message },
        { status: 500 }
      );
    }

    if (!eventos || eventos.length === 0) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const evento = eventos[0];
    
    return NextResponse.json({
      success: true,
      evento: evento,
      message: "Evento encontrado correctamente"
    }, { status: 200 });

  } catch (err) {
    console.error("❌ API Evento - Error general:", err);
    return NextResponse.json(
      { error: "Error interno del servidor: " + err.message },
      { status: 500 }
    );
  }
}