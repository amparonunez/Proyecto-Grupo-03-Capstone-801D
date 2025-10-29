import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id, puesto, nivel } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del usuario." },
        { status: 400 }
      );
    }

    const campos = {};
    if (puesto) campos.puesto = puesto;
    if (nivel) campos.nivel = nivel;

    const { error } = await supabaseAdmin
      .from("usuarios")
      .update(campos)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      message: "Usuario actualizado correctamente",
    });
  } catch (err) {
    console.error("Error en actualizar_usuario:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
