import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type"); // normalmente "email"
  const next = url.searchParams.get("next") || "/pages/confirmacion";

  // Si falta algo, redirige a error
  if (!token_hash || !type) {
    return redirect("/auth/auth-code-error");
  }

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  if (!error) {
    // Confirmado con éxito, redirige a confirmación
    return redirect(next);
  }

  // Si falla, redirige a error
  return redirect("/auth/auth-code-error");
}
