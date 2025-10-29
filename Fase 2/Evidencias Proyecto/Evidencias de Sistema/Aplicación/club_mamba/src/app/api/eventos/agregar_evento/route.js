import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ debe existir en .env.local
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { tipo, fecha, hora, lugar, descripcion, entrenador_id } = body;

    // --- Debug: devolver body si falta algo ---
    if (!tipo || !fecha || !hora || !lugar || !descripcion || !entrenador_id) {
      return new Response(
        JSON.stringify({
          error: "Faltan datos para crear el evento.",
          receivedBody: body,
        }),
        { status: 400 }
      );
    }

    // --- Verificar conexión a Supabase (simple select para chequear) ---
    const ping = await supabaseAdmin.from("usuarios").select("id").limit(1);
    if (ping.error) {
      console.error("ERROR ping a supabase:", ping.error);
      return new Response(
        JSON.stringify({ error: "Error conectando a Supabase", detail: ping.error }),
        { status: 500 }
      );
    }

    // --- Verificar rol del usuario ---
    const { data: usuario, error: userError } = await supabaseAdmin
      .from("usuarios")
      .select("rol")
      .eq("id", entrenador_id)
      .single();

    if (userError) {
      console.error("Error buscando usuario:", userError);
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado.", detail: userError }),
        { status: 404 }
      );
    }

    if (!usuario || usuario.rol !== "entrenador") {
      return new Response(JSON.stringify({ error: "No autorizado. Rol inválido.", usuario }), {
        status: 403,
      });
    }

    // --- Insertar evento y devolver el registro insertado ---
    const insertRes = await supabaseAdmin
      .from("eventos")
      .insert([
        {
          tipo: tipo.toLowerCase(),
          fecha,
          hora,
          lugar,
          descripcion,
          entrenador_id,
        },
      ])
      .select()
      .single();

    if (insertRes.error) {
      console.error("Error insertando evento:", insertRes.error);
      return new Response(
        JSON.stringify({ error: "Error insertando evento.", detail: insertRes.error }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ message: "Evento creado exitosamente.", evento: insertRes.data }), {
      status: 200,
    });
  } catch (err) {
    console.error("Catch general API /api/eventos/agregar_evento:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor.", detail: String(err) }), {
      status: 500,
    });
  }
}
