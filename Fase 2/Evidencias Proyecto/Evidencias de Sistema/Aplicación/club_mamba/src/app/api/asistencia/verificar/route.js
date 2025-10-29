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
    
    console.log("🔍 API VERIFICACIÓN - Verificando asistencia para evento:", eventoId);

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

    // Verificar si ya existen registros en resultados_finales para este evento
    const { data: registros, error, count } = await supabase
      .from("resultados_finales")
      .select("id", { count: 'exact' })
      .eq("evento_id", eventoIdNum);

    console.log("🔍 API VERIFICACIÓN - Resultados encontrados:", count);

    if (error) {
      console.error("❌ API VERIFICACIÓN - Error:", error);
      return NextResponse.json(
        { error: "Error al verificar asistencia: " + error.message },
        { status: 500 }
      );
    }

    const existeAsistencia = count > 0;
    
    return NextResponse.json({
      existe: existeAsistencia,
      count: count,
      message: existeAsistencia 
        ? `Ya existe asistencia registrada para este evento (${count} registros)`
        : "No hay asistencia registrada para este evento"
    }, { status: 200 });

  } catch (err) {
    console.error("❌ API VERIFICACIÓN - Error general:", err);
    return NextResponse.json(
      { error: "Error interno del servidor: " + err.message },
      { status: 500 }
    );
  }
}