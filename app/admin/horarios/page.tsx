"use client";

import { useEffect, useState } from "react";
export default function HorariosPage() {


    const [abierto, setAbierto] =
  useState<boolean | null>(null);

useEffect(() => {
  async function load() {
    const response = await fetch(
      "/api/configuracion"
    );

    const data = await response.json();

    setAbierto(data.abierto);
  }

  load();
}, []);
  async function cambiarEstado(
    estado: boolean
  ) {
    await fetch(
      "/api/configuracion/open",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          abierto: estado,
        }),
      }
    );

    setAbierto(estado);
  }

  return (
    <>
      <h1 className="font-display text-3xl
sm:text-4xl
lg:text-5xl font-extrabold text-tuki-cream">
        Estado de TUKI
      </h1>

      <div className="mt-10 rounded-3xl bg-tuki-night-soft p-8">
        <div className="flex items-center gap-3">
          <div
            className={`h-4 w-4 rounded-full ${
              abierto
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />

          <span className="text-2xl font-bold text-tuki-cream">
            {abierto
              ? "ABIERTO"
              : "CERRADO"}
          </span>
        </div>

        <div
className="
mt-8
flex
flex-col
gap-3
sm:flex-row
"
>
          <button
            onClick={() =>
              cambiarEstado(true)
            }
            className="
              rounded-2xl
              bg-green-500
              px-6 py-3
              font-bold
              text-black
            "
          >
            Abrir
          </button>

          <button
            onClick={() =>
              cambiarEstado(false)
            }
            className="
              rounded-2xl
              bg-red-500
              px-6 py-3
              font-bold
              text-white
            "
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}