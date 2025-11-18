"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/pages/login");
        return;
      }

      const res = await fetch("/api/usuarios/rol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const result = await res.json();

      if (!res.ok || !result.rol) {
        router.replace("/");
        return;
      }

      if (!allowedRoles.includes(result.rol)) {
        router.replace("/");
        return;
      }

      // Espera un instante para la animación de fade-out
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => setShowOverlay(false), 300);
      }, 300);
    };

    checkAccess();
  }, [router, allowedRoles]);

  return (
    <div className="relative">
      {children}

      {showOverlay && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 z-50 ${
            loading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-yellow-300 text-lg animate-pulse">
              Cargando......
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
