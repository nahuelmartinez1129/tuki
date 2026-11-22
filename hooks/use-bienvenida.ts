"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

/**
 * ¿El visitante todavía tiene disponible el
 * bono de bienvenida?
 *
 * - Sin teléfono registrado: sí (es nuevo).
 * - Con teléfono: lo confirma /api/beneficios.
 *
 * El control definitivo (incluida la dirección
 * de entrega) lo hace el checkout y /api/pedidos.
 */
export function useBienvenida() {
  const { phone } = useUser();

  const [disponible, setDisponible] =
    useState(false);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const params = new URLSearchParams();

        if (phone) {
          params.set("phone", phone);
        }

        const response = await fetch(
          `/api/beneficios?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelado) {
          setDisponible(Boolean(data.primeraCompra));
        }
      } catch {
        // Si falla, simplemente no mostramos el bono.
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [phone]);

  return disponible;
}
