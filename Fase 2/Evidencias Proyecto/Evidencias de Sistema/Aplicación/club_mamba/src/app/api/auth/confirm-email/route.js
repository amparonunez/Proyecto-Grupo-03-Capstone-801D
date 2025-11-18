import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: "Faltan parámetros (token o email)" },
        { status: 400 }
      );
    }

    console.log("📩 Verificando token para:", email);

    // Crear cliente público temporal
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // ✅ Verificamos el token corto tipo "email_change"
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email_change",
    });

    if (error) {
      console.error("❌ Error en verifyOtp:", error.message);
      return NextResponse.json(
        { error: error.message || "Token inválido o expirado" },
        { status: 400 }
      );
    }

    const user = data.user;
    console.log("✅ Email verificado correctamente:", user.email);

    // ✅ Actualizamos en la tabla usuarios
    const { error: updateError } = await supabaseAdmin
      .from("usuarios")
      .update({ email: user.email })
      .eq("id", user.id);

    if (updateError) throw updateError;

    console.log("🧠 Email actualizado en tabla usuarios.");

    return NextResponse.json({
      message: "Correo confirmado correctamente.",
      user,
    });
  } catch (err) {
    console.error("❌ Error en /api/auth/confirm-email:", err);
    return NextResponse.json(
      { error: "Error interno: " + err.message },
      { status: 500 }
    );
  }
}
