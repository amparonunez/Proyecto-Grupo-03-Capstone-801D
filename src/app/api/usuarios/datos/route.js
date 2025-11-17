import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente con la clave del service role (ignora RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id } = await req.json();

    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("id, nombre, rol, nivel") // agrega más columnas si quieres
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
