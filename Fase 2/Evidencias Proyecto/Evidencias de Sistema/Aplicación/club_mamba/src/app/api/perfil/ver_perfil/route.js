import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ error: "Falta el ID del usuario" }, { status: 400 });
    }

    // 🔹 Datos básicos
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user_id)
      .single();

    if (usuarioError) throw usuarioError;

    // 🔹 Estadísticas totales
    const { data: stats, error: statsError } = await supabase
      .from("estadisticas")
      .select("puntos, rebotes, asistencias, robos, bloqueos, evento_id")
      .eq("usuario_id", user_id);

    if (statsError) throw statsError;

    const total = stats?.reduce(
      (acc, e) => ({
        puntos: acc.puntos + e.puntos,
        rebotes: acc.rebotes + e.rebotes,
        asistencias: acc.asistencias + e.asistencias,
        robos: acc.robos + e.robos,
        bloqueos: acc.bloqueos + e.bloqueos,
        partidos: acc.partidos + 1,
      }),
      { puntos: 0, rebotes: 0, asistencias: 0, robos: 0, bloqueos: 0, partidos: 0 }
    );

    // 🔹 Si es entrenador, obtener conteo de eventos
    let entrenador = null;
    if (usuario.rol === "entrenador") {
      const { data: eventos } = await supabase
        .from("eventos")
        .select("tipo, id, fecha, lugar")
        .eq("entrenador_id", user_id);

      const totalEntrenamientos = eventos?.filter((e) => e.tipo === "entrenamiento").length || 0;
      const totalPartidos = eventos?.filter((e) => e.tipo === "partido").length || 0;

      entrenador = {
        totalEntrenamientos,
        totalPartidos,
        recientes: eventos?.slice(0, 3) || [],
      };
    }

    return NextResponse.json({ usuario, total, entrenador });
  } catch (err) {
    console.error("Error en /api/perfil/ver_perfil:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
