import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("eventos")
      .select("id, tipo, fecha, hora, lugar, descripcion")
      .order("fecha", { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Error en /api/eventos/ver_evento:", err);
    return new Response(
      JSON.stringify({ error: "Error al obtener los eventos." }),
      { status: 500 }
    );
  }
}
