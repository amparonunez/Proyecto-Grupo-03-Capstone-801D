import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("eventos")
      .select(`
        id, 
        tipo, 
        fecha, 
        hora, 
        lugar, 
        descripcion,
        entrenador_id,
        usuarios:entrenador_id (id, nombre, apellidos)
      `)
      .order("fecha", { ascending: true });

    if (error) throw error;

    // 🔥 Formatear el tipo en la API
    const eventosFormateados = data.map(evento => ({
      ...evento,
      tipo: evento.tipo 
        ? evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1).toLowerCase()
        : evento.tipo
    }));

    return new Response(JSON.stringify(eventosFormateados), { status: 200 });
  } catch (err) {
    console.error("Error en /api/eventos/ver_evento:", err);
    return new Response(
      JSON.stringify({ error: "Error al obtener los eventos." }),
      { status: 500 }
    );
  }
}