import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const url = new URL(request.url);

  // Supabase envía uno de estos
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type"); // en este caso será "email_change"
  const next = url.searchParams.get("next") || "/auth/confirmacion-correonuevo";

  // Validación mínima
  if (!token_hash || !type) {
    return redirect("/auth/auth-code-error");
  }

  // Verificar token con Service Role (funciona siempre)
  const { error } = await supabase.auth.verifyOtp({
    type,        // "email_change"
    token_hash,  // token enviado por correo
  });

  if (!error) {
    // Confirmado → redirige a la página éxito
    return redirect(next);
  }

  // Error → página de error
  return redirect("/auth/auth-code-error");
}
