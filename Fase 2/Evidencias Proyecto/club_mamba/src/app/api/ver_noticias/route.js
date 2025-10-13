// pages/api/noticias/index.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("noticias")
      .select("id, titulo, contenido, fecha, usuarios(nombre, apellidos)")
      .order("fecha", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ noticias: data }), { status: 200 });
  } catch (err) {
    console.error("Error al obtener noticias:", err);
    return new Response(JSON.stringify({ error: "Error interno del servidor." }), { status: 500 });
  }
}
