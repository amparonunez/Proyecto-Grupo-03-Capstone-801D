"use client";

import { Suspense } from "react";
import VisualizarAsistenciaClient from "./VisualizarAsistenciaClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ color: "white" }}>Cargando asistencia...</div>}>
      <VisualizarAsistenciaClient />
    </Suspense>
  );
}
