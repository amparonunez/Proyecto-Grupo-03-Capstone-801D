import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("eventos")
    .select("id, tipo, fecha, hora, lugar, descripcion");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Transformar todos los eventos correctamente
  const eventos = data.map((e) => {
    // "2024-11-10" → ["2024", "11", "10"]
    const [y, m, d] = e.fecha.split("-").map(Number);

    // Fecha correcta sin desfase por zona horaria
    const fechaObj = new Date(y, m - 1, d);

    const diaSemana = fechaObj.toLocaleString("es-ES", { weekday: "long" });
    const mesCorto = fechaObj.toLocaleString("es-ES", { month: "short" });

    const fechaFormateada = `${capitalizar(diaSemana)} ${d} ${capitalizar(mesCorto)}`;

    return {
      id: e.id,
      tipo: e.tipo,
      categoria: e.tipo, // entrenamiento | partido
      descripcion: e.descripcion,
      hora: e.hora,
      fecha: fechaFormateada, // FECHA FORMATEADA Y CORRECTA
      fechaISO: e.fecha,
      color:
        e.tipo === "entrenamiento"
          ? "bg-yellow-500"
          : e.tipo === "partido"
          ? "bg-red-500"
          : "bg-blue-500",
    };
  });

  return NextResponse.json(eventos);
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
