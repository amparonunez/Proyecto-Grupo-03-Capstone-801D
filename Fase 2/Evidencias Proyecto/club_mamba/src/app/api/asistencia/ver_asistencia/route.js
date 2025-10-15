import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuario_id');
    const rol = searchParams.get('rol');
    
    const hoy = new Date().toISOString().split('T')[0];
    
    console.log("🔍 Buscando eventos para asistencia - Usuario:", usuarioId, "Rol:", rol);

    // Si es entrenador, puede ver todos los eventos con inscripciones
    if (rol === 'entrenador') {
      console.log("🎯 Entrenador - Mostrando todos los eventos con inscripciones");
      
      const { data: eventos, error } = await supabase
        .from("eventos")
        .select(`
          id, 
          tipo, 
          fecha, 
          hora, 
          descripcion, 
          lugar,
          inscripciones!inner (id)
        `)
        .gte("fecha", hoy)
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true });

      if (error) {
        console.error("❌ Error en query de eventos:", error);
        throw error;
      }

      console.log(`📊 Eventos encontrados para entrenador: ${eventos?.length || 0}`);

      const eventosConJugadores = eventos
        .filter(evento => evento.inscripciones && evento.inscripciones.length > 0)
        .map(evento => ({
          id: evento.id,
          tipo: evento.tipo,
          fecha: evento.fecha,
          hora: evento.hora,
          descripcion: evento.descripcion,
          lugar: evento.lugar,
          jugadores_inscritos: evento.inscripciones.length
        }));

      return NextResponse.json({ 
        eventos: eventosConJugadores,
        message: eventosConJugadores.length === 0 
          ? "No hay eventos próximos con jugadores inscritos" 
          : `Se encontraron ${eventosConJugadores.length} eventos con jugadores inscritos`
      }, { status: 200 });
    }

    // Si es jugador, solo puede ver eventos donde está inscrito
    if (rol === 'jugador' && usuarioId) {
      console.log("🎯 Jugador - Buscando eventos donde está inscrito");
      
      // Buscar eventos donde el jugador está inscrito
      const { data: eventosInscritos, error: inscError } = await supabase
        .from("inscripciones")
        .select(`
          evento_id,
          eventos (
            id,
            tipo,
            fecha,
            hora,
            descripcion,
            lugar,
            inscripciones!inner (id)
          )
        `)
        .eq("usuario_id", usuarioId)
        .eq("inscrito", true)
        .gte("eventos.fecha", hoy);

      if (inscError) {
        console.error("❌ Error en inscripciones:", inscError);
        throw inscError;
      }

      console.log(`📊 Eventos inscritos encontrados: ${eventosInscritos?.length || 0}`);

      const eventosConJugadores = eventosInscritos
        ?.filter(item => item.eventos && item.eventos.inscripciones && item.eventos.inscripciones.length > 0)
        .map(item => ({
          id: item.eventos.id,
          tipo: item.eventos.tipo,
          fecha: item.eventos.fecha,
          hora: item.eventos.hora,
          descripcion: item.eventos.descripcion,
          lugar: item.eventos.lugar,
          jugadores_inscritos: item.eventos.inscripciones.length
        })) || [];

      // Ordenar por fecha y hora
      eventosConJugadores.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaA - fechaB;
      });

      return NextResponse.json({ 
        eventos: eventosConJugadores,
        message: eventosConJugadores.length === 0 
          ? "No estás inscrito en ningún evento próximo" 
          : `Tienes ${eventosConJugadores.length} eventos inscritos`
      }, { status: 200 });
    }

    // Si no hay usuario_id o rol, retornar error
    return NextResponse.json(
      { 
        error: "Se requiere usuario_id y rol para cargar eventos", 
        eventos: [] 
      },
      { status: 400 }
    );

  } catch (err) {
    console.error("❌ Error general al obtener eventos:", err.message);
    return NextResponse.json(
      { 
        error: "Error al cargar los eventos.", 
        eventos: [],
        message: "Error del servidor"
      },
      { status: 500 }
    );
  }
}