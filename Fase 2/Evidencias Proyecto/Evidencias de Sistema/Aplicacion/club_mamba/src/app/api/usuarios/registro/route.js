import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔹 Usa tu URL y Service Role Key de Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, nombre, apellidos, rut } = body;

    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .insert([{ id, nombre, apellidos, rut }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
