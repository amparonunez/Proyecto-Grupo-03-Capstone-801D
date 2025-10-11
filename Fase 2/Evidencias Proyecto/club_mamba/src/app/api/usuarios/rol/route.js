import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente administrador (ignora RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id } = await req.json();

    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("rol")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ rol: data.rol });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
