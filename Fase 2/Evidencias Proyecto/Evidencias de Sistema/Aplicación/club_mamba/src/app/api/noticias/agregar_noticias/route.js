import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ service role key (no la pública)
);

export async function POST(req) {
  try {
    const { titulo, contenido, fecha, userId } = await req.json();

    if (!titulo || !contenido || !fecha || !userId) {
      return new Response(
        JSON.stringify({ error: "Faltan datos para crear la noticia." }),
        { status: 400 }
      );
    }

    // Validar que el usuario sea entrenador
    const { data: usuario, error: userError } = await supabaseAdmin
      .from("usuarios")
      .select("rol")
      .eq("id", userId)
      .single();

    if (userError || !usuario) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado." }), {
        status: 404,
      });
    }

    if (usuario.rol !== "entrenador") {
      return new Response(JSON.stringify({ error: "No autorizado." }), {
        status: 403,
      });
    }

    const { error } = await supabaseAdmin.from("noticias").insert([
      {
        titulo,
        contenido,
        fecha,
        autor_id: userId,
      },
    ]);

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Noticia creada exitosamente." }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error en API /api/noticias:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500 }
    );
  }
}
