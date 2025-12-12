import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente con service role para omitir RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      id,
      nombre,
      apellidos,
      puesto,
      nivel,
      estatura,
      peso,
      talla_uniforme,
      contacto_de_emergencia,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el id del usuario para actualizar." },
        { status: 400 }
      );
    }

    const payload = Object.fromEntries(
      Object.entries({
        nombre,
        apellidos,
        puesto,
        nivel,
        estatura,
        peso,
        talla_uniforme,
        contacto_de_emergencia,
      }).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { error: "No se enviaron campos para actualizar." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .update(payload)
      .eq("id", id)
      .select(
        `
        id,
        nombre,
        apellidos,
        puesto,
        nivel,
        estatura,
        peso,
        talla_uniforme,
        contacto_de_emergencia
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
