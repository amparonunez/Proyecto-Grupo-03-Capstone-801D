import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_ids } = body;
    
    console.log("🔍 API Usuarios - Buscando IDs:", user_ids);

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { error: "Se requiere array de user_ids" },
        { status: 400 }
      );
    }

    // Consultar usuarios
    const { data: usuarios, error } = await supabase
      .from("usuarios")
      .select("id, nombre, apellidos, puesto, rol")
      .in("id", user_ids);

    console.log("📋 API Usuarios - Resultado:", { 
      count: usuarios?.length, 
      error 
    });

    if (error) {
      return NextResponse.json(
        { error: "Error al buscar usuarios: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      usuarios: usuarios || [],
      count: usuarios?.length || 0,
      message: usuarios?.length === 0 
        ? "No se encontraron usuarios" 
        : `Se encontraron ${usuarios.length} usuarios`
    }, { status: 200 });

  } catch (err) {
    console.error("❌ API Usuarios - Error general:", err);
    return NextResponse.json(
      { error: "Error interno del servidor: " + err.message },
      { status: 500 }
    );
  }
}