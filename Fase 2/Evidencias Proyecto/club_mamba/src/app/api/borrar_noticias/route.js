import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function DELETE(req) {
  try {
    const { id, userId } = await req.json();

    if (!id || !userId) {
      return new Response(
        JSON.stringify({ error: "Faltan datos para eliminar la noticia." }),
        { status: 400 }
      );
    }

    // Verificar rol
    const { data: usuario, error: userError } = await supabaseAdmin
      .from("usuarios")
      .select("rol")
      .eq("id", userId)
      .single();

    if (userError || !usuario) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado." }),
        { status: 404 }
      );
    }

    if (usuario.rol !== "entrenador") {
      return new Response(
        JSON.stringify({ error: "No autorizado para borrar noticias." }),
        { status: 403 }
      );
    }

    // Eliminar noticia
    const { error: deleteError } = await supabaseAdmin
      .from("noticias")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error al eliminar noticia:", deleteError.message);
      return new Response(
        JSON.stringify({ error: "Error al eliminar la noticia." }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Noticia eliminada exitosamente." }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error interno en /api/borrar_noticias:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500 }
    );
  }
}
