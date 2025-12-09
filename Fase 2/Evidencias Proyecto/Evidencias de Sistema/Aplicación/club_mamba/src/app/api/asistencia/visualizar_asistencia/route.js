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
    const usuarioId = searchParams.get('usuario_id');
    
    console.log("🔍 API VISUALIZAR - Evento ID:", eventoId, "Usuario ID:", usuarioId);

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

    // 🔄 PASO 1: Obtener información del evento INCLUYENDO entrenador_id
    const { data: eventos, error: eventoError } = await supabase
      .from("eventos")
      .select("id, tipo, fecha, hora, lugar, descripcion, entrenador_id")
      .eq("id", eventoIdNum);

    if (eventoError) {
      console.error("❌ API VISUALIZAR - Error en evento:", eventoError);
      return NextResponse.json(
        { error: "Error al cargar evento: " + eventoError.message },
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
    console.log("✅ API VISUALIZAR - Evento encontrado:", evento);

    // 🔄 PASO 1.5: Obtener información del entrenador
    let entrenadorInfo = null;
    if (evento.entrenador_id) {
      const { data: entrenador, error: entrenadorError } = await supabase
        .from("usuarios")
        .select("nombre, apellidos")
        .eq("id", evento.entrenador_id)
        .single();

      if (!entrenadorError && entrenador) {
        entrenadorInfo = {
          nombre: entrenador.nombre,
          apellidos: entrenador.apellidos
        };
        console.log("👨‍💼 API VISUALIZAR - Entrenador encontrado:", entrenadorInfo);
      } else {
        console.warn("⚠️ API VISUALIZAR - No se pudo cargar información del entrenador");
      }
    }

    // 🔄 PASO 2: Obtener resultados_finales del evento
    const { data: resultados, error: resultadosError } = await supabase
      .from("resultados_finales")
      .select(`
        usuario_id,
        puntos,
        rebotes,
        asistencias,
        robos,
        bloqueos,
        presente,
        duracion
      `)
      .eq("evento_id", eventoIdNum)
      .order('puntos', { ascending: false });

    if (resultadosError) {
      console.error("❌ API VISUALIZAR - Error en resultados:", resultadosError);
      return NextResponse.json(
        { error: "Error al cargar resultados: " + resultadosError.message },
        { status: 500 }
      );
    }

    console.log("📊 API VISUALIZAR - Resultados encontrados:", resultados?.length);

    // 🔄 PASO 2.1: Obtener estadísticas con desglose de puntos
    const { data: estadisticas, error: estadisticasError } = await supabase
      .from("estadisticas")
      .select(`
        id,
        usuario_id,
        puntos,
        rebotes,
        asistencias,
        robos,
        bloqueos,
        desglose:desglose_puntos ( tipo_tiro, cantidad )
      `)
      .eq("evento_id", eventoIdNum);

    if (estadisticasError) {
      console.warn("⚠️ API VISUALIZAR - No se pudieron cargar estadísticas detalladas:", estadisticasError);
    } else {
      console.log("📊 API VISUALIZAR - Estadísticas detalladas cargadas:", estadisticas?.length);
    }

    const mapaEstadisticas = new Map();
    estadisticas?.forEach((stat) => {
      mapaEstadisticas.set(stat.usuario_id, stat);
    });

    // 🔄 PASO 3: Obtener datos de usuarios por separado
    if (!resultados || resultados.length === 0) {
      return NextResponse.json({
        success: true,
        evento: {
          ...evento,
          entrenador: entrenadorInfo
        },
        jugadores: [],
        totalesEquipo: {
          puntos: 0,
          rebotes: 0,
          asistencias: 0,
          robos: 0,
          bloqueos: 0,
          totalJugadores: 0,
          presentes: 0,
          ausentes: 0
        },
        jugadorActual: null,
        message: "No hay datos de asistencia para este evento"
      }, { status: 200 });
    }

    // Obtener IDs de usuarios únicos
    const userIds = [...new Set(resultados.map(r => r.usuario_id))];
    console.log("🆔 User IDs a buscar:", userIds);

    // Consultar usuarios por separado
    const { data: usuarios, error: usuariosError } = await supabase
      .from("usuarios")
      .select("id, nombre, apellidos, puesto")
      .in("id", userIds);

    if (usuariosError) {
      console.error("❌ API VISUALIZAR - Error en usuarios:", usuariosError);
      return NextResponse.json(
        { error: "Error al cargar usuarios: " + usuariosError.message },
        { status: 500 }
      );
    }

    console.log("👤 API VISUALIZAR - Usuarios encontrados:", usuarios?.length);

    // 🔄 PASO 4: Combinar datos de resultados y usuarios
    const jugadoresConEstadisticas = resultados.map(resultado => {
      const usuario = usuarios?.find(u => u.id === resultado.usuario_id);
      const stat = mapaEstadisticas.get(resultado.usuario_id);
      const desglose = stat?.desglose || [];
      const desgloseContado = desglose.reduce(
        (acc, d) => {
          if (d.tipo_tiro === "triple") acc.triples += d.cantidad || 0;
          if (d.tipo_tiro === "doble") acc.dobles += d.cantidad || 0;
          if (d.tipo_tiro === "tiro_libre") acc.tiros_libres += d.cantidad || 0;
          return acc;
        },
        { triples: 0, dobles: 0, tiros_libres: 0 }
      );
      
      return {
        id: resultado.usuario_id,
        nombre: usuario?.nombre || "Jugador",
        apellidos: usuario?.apellidos || "",
        puesto: usuario?.puesto || "Sin definir",
        presente: resultado.presente,
        puntos: stat?.puntos ?? resultado.puntos ?? 0,
        rebotes: stat?.rebotes ?? resultado.rebotes ?? 0,
        asistencias: stat?.asistencias ?? resultado.asistencias ?? 0,
        robos: stat?.robos ?? resultado.robos ?? 0,
        bloqueos: stat?.bloqueos ?? resultado.bloqueos ?? 0,
        triples: desgloseContado.triples,
        dobles: desgloseContado.dobles,
        tiros_libres: desgloseContado.tiros_libres,
        esJugadorActual: resultado.usuario_id === usuarioId
      };
    });

    // 🔄 PASO 5: Calcular totales del equipo
    const totalesEquipo = {
      puntos: jugadoresConEstadisticas.reduce((sum, j) => sum + j.puntos, 0),
      rebotes: jugadoresConEstadisticas.reduce((sum, j) => sum + j.rebotes, 0),
      asistencias: jugadoresConEstadisticas.reduce((sum, j) => sum + j.asistencias, 0),
      robos: jugadoresConEstadisticas.reduce((sum, j) => sum + j.robos, 0),
      bloqueos: jugadoresConEstadisticas.reduce((sum, j) => sum + j.bloqueos, 0),
      triples: jugadoresConEstadisticas.reduce((sum, j) => sum + (j.triples || 0), 0),
      dobles: jugadoresConEstadisticas.reduce((sum, j) => sum + (j.dobles || 0), 0),
      tiros_libres: jugadoresConEstadisticas.reduce((sum, j) => sum + (j.tiros_libres || 0), 0),
      totalJugadores: jugadoresConEstadisticas.length,
      presentes: jugadoresConEstadisticas.filter(j => j.presente).length,
      ausentes: jugadoresConEstadisticas.filter(j => !j.presente).length
    };

    // 🔄 PASO 6: Encontrar al jugador actual (si se proporcionó usuario_id)
    const jugadorActual = usuarioId 
      ? jugadoresConEstadisticas.find(j => j.id === usuarioId)
      : null;

    console.log("✅ API VISUALIZAR - Datos procesados correctamente");

    return NextResponse.json({
      success: true,
      evento: {
        id: evento.id,
        tipo: evento.tipo,
        fecha: evento.fecha,
        hora: evento.hora,
        lugar: evento.lugar,
        descripcion: evento.descripcion,
        duracion: resultados[0]?.duracion || "00:00",
        entrenador: entrenadorInfo // ✅ INCLUIMOS LA INFO DEL ENTRENADOR
      },
      jugadores: jugadoresConEstadisticas,
      totalesEquipo: totalesEquipo,
      jugadorActual: jugadorActual,
      message: `Se cargaron ${jugadoresConEstadisticas.length} jugadores`
    }, { status: 200 });

  } catch (err) {
    console.error("💥 API VISUALIZAR - Error general:", err);
    return NextResponse.json(
      { error: "Error interno del servidor: " + err.message },
      { status: 500 }
    );
  }
}
