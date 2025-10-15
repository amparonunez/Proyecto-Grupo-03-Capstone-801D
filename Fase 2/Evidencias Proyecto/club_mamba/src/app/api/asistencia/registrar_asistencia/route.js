import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    console.log("🔵 API REGISTRO - Iniciando...");
    
    const body = await req.json();
    console.log("📥 API REGISTRO - Datos recibidos:", {
      evento_id: body.evento_id,
      jugadores_count: body.jugadores?.length,
      duracion: body.duracion
    });

    const { evento_id, jugadores, totalEquipo, duracion } = body;

    // Validaciones
    if (!evento_id) {
      return NextResponse.json({ error: "Falta el ID del evento" }, { status: 400 });
    }

    if (!jugadores || jugadores.length === 0) {
      return NextResponse.json({ error: "No hay jugadores para registrar" }, { status: 400 });
    }

    console.log(`🔍 API REGISTRO - Verificando evento ${evento_id}...`);
    
    // Verificar evento
    const { data: eventos, error: eventoError } = await supabase
      .from("eventos")
      .select("id, entrenador_id")
      .eq("id", evento_id);

    if (eventoError) {
      console.error("❌ API REGISTRO - Error en evento:", eventoError);
      return NextResponse.json({ error: "Error al buscar evento: " + eventoError.message }, { status: 404 });
    }

    if (!eventos || eventos.length === 0) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const evento = eventos[0];
    console.log("✅ API REGISTRO - Evento encontrado:", evento);

    // 🔄 PASO 1: Obtener TODOS los jugadores inscritos en el evento (incluyendo los que no asistieron)
    console.log("👥 API REGISTRO - Buscando todos los jugadores inscritos...");
    const { data: inscripciones, error: inscError } = await supabase
      .from("inscripciones")
      .select("usuario_id")
      .eq("evento_id", evento_id)
      .eq("inscrito", true);

    if (inscError) {
      console.error("❌ API REGISTRO - Error en inscripciones:", inscError);
      return NextResponse.json({ error: "Error al cargar inscripciones: " + inscError.message }, { status: 500 });
    }

    console.log("📊 API REGISTRO - Inscripciones encontradas:", inscripciones?.length);

    // 🔄 PASO 2: Crear registros para TODOS los jugadores inscritos
    const todosLosJugadoresInscritos = inscripciones || [];
    
    const registrosResultados = todosLosJugadoresInscritos.map(inscripcion => {
      // Buscar si este jugador está en la lista de jugadores que asistieron
      const jugadorAsistio = jugadores.find(j => j.id === inscripcion.usuario_id);
      
      if (jugadorAsistio) {
        // Jugador ASISTIÓ - usar sus estadísticas reales
        return {
          evento_id: evento_id,
          usuario_id: inscripcion.usuario_id,
          puntos: jugadorAsistio.puntos || 0,
          rebotes: jugadorAsistio.rebotes || 0,
          asistencias: jugadorAsistio.asistencias || 0,
          robos: jugadorAsistio.robos || 0,
          bloqueos: jugadorAsistio.bloqueos || 0,
          presente: true, // Marcamos como presente
          duracion: duracion || "00:00",
          total_equipo_puntos: totalEquipo?.puntos || 0,
          total_equipo_rebotes: totalEquipo?.rebotes || 0,
          total_equipo_asistencias: totalEquipo?.asistencias || 0,
          total_equipo_robos: totalEquipo?.robos || 0,
          total_equipo_bloqueos: totalEquipo?.bloqueos || 0,
          entrenador_id: evento.entrenador_id,
        };
      } else {
        // Jugador NO ASISTIÓ - estadísticas en cero
        return {
          evento_id: evento_id,
          usuario_id: inscripcion.usuario_id,
          puntos: 0,
          rebotes: 0,
          asistencias: 0,
          robos: 0,
          bloqueos: 0,
          presente: false, // Marcamos como ausente
          duracion: duracion || "00:00",
          total_equipo_puntos: totalEquipo?.puntos || 0,
          total_equipo_rebotes: totalEquipo?.rebotes || 0,
          total_equipo_asistencias: totalEquipo?.asistencias || 0,
          total_equipo_robos: totalEquipo?.robos || 0,
          total_equipo_bloqueos: totalEquipo?.bloqueos || 0,
          entrenador_id: evento.entrenador_id,
        };
      }
    });

    console.log(`💾 API REGISTRO - Insertando ${registrosResultados.length} registros (${jugadores.length} presentes + ${registrosResultados.length - jugadores.length} ausentes)...`);

    // 🔄 PASO 3: Insertar en resultados_finales
    const { data: resultados, error: resultadosError } = await supabase
      .from("resultados_finales")
      .insert(registrosResultados)
      .select();

    if (resultadosError) {
      console.error("❌ API REGISTRO - Error insertando:", resultadosError);
      return NextResponse.json({ 
        error: "Error al guardar resultados: " + resultadosError.message,
        details: resultadosError.details,
        hint: resultadosError.hint
      }, { status: 500 });
    }

    // Contar presentes y ausentes
    const presentes = registrosResultados.filter(r => r.presente).length;
    const ausentes = registrosResultados.filter(r => !r.presente).length;

    console.log(`✅ API REGISTRO - Resultados guardados: ${presentes} presentes, ${ausentes} ausentes`);

    // 🔄 PASO 4: Registrar en estadísticas también (solo para los que asistieron)
    try {
      const registrosEstadisticas = jugadores.map((jugador) => ({
        usuario_id: jugador.id,
        evento_id: evento_id,
        puntos: jugador.puntos || 0,
        rebotes: jugador.rebotes || 0,
        asistencias: jugador.asistencias || 0,
        robos: jugador.robos || 0,
        bloqueos: jugador.bloqueos || 0,
      }));

      const { error: statsError } = await supabase
        .from("estadisticas")
        .upsert(registrosEstadisticas, { 
          onConflict: 'usuario_id,evento_id'
        });

      if (statsError) {
        console.warn("⚠️ API REGISTRO - Error en estadísticas:", statsError);
      } else {
        console.log("✅ API REGISTRO - Estadísticas guardadas para jugadores presentes");
      }
    } catch (statsErr) {
      console.warn("⚠️ API REGISTRO - Error secundario en estadísticas:", statsErr);
    }

    console.log("🎉 API REGISTRO - Proceso completado exitosamente");

    return NextResponse.json({ 
      success: true, 
      message: `Asistencia registrada para ${presentes} jugadores presentes y ${ausentes} ausentes`,
      datos: {
        evento_id,
        jugadores_presentes: presentes,
        jugadores_ausentes: ausentes,
        total_jugadores: registrosResultados.length,
        duracion
      }
    }, { status: 200 });

  } catch (err) {
    console.error("💥 API REGISTRO - Error general:", err);
    return NextResponse.json({ 
      error: "Error interno del servidor: " + err.message 
    }, { status: 500 });
  }
}