"use client";

import { Suspense } from "react";
import AsistenciaPage from "./RegistrarAsistenciaClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-10">Cargando...</div>}>
      <AsistenciaPage />
    </Suspense>
  );
}
