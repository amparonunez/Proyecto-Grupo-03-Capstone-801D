import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key (⚠️ no la pública)
);

export async function POST(req) {
  try {
    const { evento_id, usuario_id } = await req.json();

    // 1️⃣ Verificar que el usuario exista y tenga rol jugador
    const { data: usuario, error: userError } = await supabaseAdmin
      .from("usuarios")
      .select("rol")
      .eq("id", usuario_id)
      .single();

    if (userError || !usuario) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado." }), {
        status: 404,
      });
    }

    if (usuario.rol !== "jugador") {
      return new Response(JSON.stringify({ error: "Solo los jugadores pueden inscribirse." }), {
        status: 403,
      });
    }

    // 2️⃣ Verificar si ya está inscrito (por la constraint UNIQUE)
    const { data: yaInscrito } = await supabaseAdmin
      .from("inscripciones")
      .select("id")
      .eq("usuario_id", usuario_id)
      .eq("evento_id", evento_id)
      .maybeSingle();

    if (yaInscrito) {
      return new Response(
        JSON.stringify({ error: "Ya estás inscrito en este evento." }),
        { status: 409 }
      );
    }

    // 3️⃣ Insertar nueva inscripción
    const { error: insertError } = await supabaseAdmin
      .from("inscripciones")
      .insert([{ usuario_id, evento_id, inscrito: true }]);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ message: "Inscripción realizada con éxito." }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error en API /api/eventos/inscribirse:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500 }
    );
  }
}
