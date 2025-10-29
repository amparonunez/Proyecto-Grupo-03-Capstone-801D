import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del usuario." }, { status: 400 });
    }

    // 1️⃣ Obtener todas las estadísticas del jugador
    const { data, error } = await supabaseAdmin
      .from("estadisticas")
      .select("puntos, rebotes, asistencias, robos, bloqueos")
      .eq("usuario_id", id);

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({
        message: "El jugador no tiene estadísticas registradas.",
        data: {
          partidos_jugados: 0,
          total_puntos: 0,
          total_rebotes: 0,
          total_asistencias: 0,
          total_robos: 0,
          total_bloqueos: 0,
        },
      });
    }

    // 2️⃣ Calcular totales en el servidor
    const totales = data.reduce(
      (acc, curr) => ({
        partidos_jugados: acc.partidos_jugados + 1,
        total_puntos: acc.total_puntos + (curr.puntos || 0),
        total_rebotes: acc.total_rebotes + (curr.rebotes || 0),
        total_asistencias: acc.total_asistencias + (curr.asistencias || 0),
        total_robos: acc.total_robos + (curr.robos || 0),
        total_bloqueos: acc.total_bloqueos + (curr.bloqueos || 0),
      }),
      {
        partidos_jugados: 0,
        total_puntos: 0,
        total_rebotes: 0,
        total_asistencias: 0,
        total_robos: 0,
        total_bloqueos: 0,
      }
    );

    return NextResponse.json({
      message: "Totales calculados correctamente",
      data: totales,
    });
  } catch (err) {
    console.error("Error en API ver_estadisticas:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
