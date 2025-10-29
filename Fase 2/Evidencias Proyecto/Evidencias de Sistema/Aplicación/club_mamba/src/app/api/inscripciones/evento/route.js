import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('evento_id');
    
    console.log("🔍 API Inscripciones - Buscando para evento:", eventoId);

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

    // Consultar inscripciones
    const { data: inscripciones, error } = await supabase
      .from("inscripciones")
      .select("usuario_id, inscrito")
      .eq("evento_id", eventoIdNum)
      .eq("inscrito", true);

    console.log("📋 API Inscripciones - Resultado:", { 
      count: inscripciones?.length, 
      error 
    });

    if (error) {
      return NextResponse.json(
        { error: "Error al buscar inscripciones: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inscripciones: inscripciones || [],
      count: inscripciones?.length || 0,
      message: inscripciones?.length === 0 
        ? "No hay inscripciones para este evento" 
        : `Se encontraron ${inscripciones.length} inscripciones`
    }, { status: 200 });

  } catch (err) {
    console.error("❌ API Inscripciones - Error general:", err);
    return NextResponse.json(
      { error: "Error interno del servidor: " + err.message },
      { status: 500 }
    );
  }
}