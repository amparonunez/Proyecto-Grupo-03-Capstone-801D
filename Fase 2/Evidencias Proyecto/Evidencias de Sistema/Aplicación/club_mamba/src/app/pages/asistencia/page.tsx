"use client";

import { Suspense } from "react";
import AsistenciaClient from "./AsistenciaClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ color: "white" }}>Cargando asistencia...</div>}>
      <AsistenciaClient />
    </Suspense>
  );
}
