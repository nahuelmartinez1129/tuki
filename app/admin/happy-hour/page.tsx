"use client";

import {
  useEffect,
  useState,
} from "react";

export default function HappyHourPage() {
  const [
    happyHours,
    setHappyHours,
  ] = useState<any[]>([]);

  async function load() {
    const response = await fetch(
      "/api/happy-hour/all"
    );

    const data =
      await response.json();

    setHappyHours(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function activar(
    id: string
  ) {
    await fetch(
      "/api/happy-hour/activate",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      }
    );

    load();
  }

  async function desactivar() {
  await fetch(
    "/api/happy-hour/deactivate",
    {
      method: "POST",
    }
  );

  load();
}
  return (
   <>
  <div
className="
flex
flex-col
gap-4
sm:flex-row
sm:items-center
sm:justify-between
"
>
    <h1 className="text-3xl
sm:text-4xl
lg:text-5xl font-bold text-tuki-cream">
      Happy Hour
    </h1>

    <button
      onClick={desactivar}
      className="
        rounded-2xl
        bg-red-500
        px-5
        py-3
        font-bold
        text-white
        hover:opacity-90
      "
    >
      Desactivar todos
    </button>
  </div>
      <div className="mt-10 space-y-4">
        {happyHours.map((h) => (
          <div
            key={h.id}
            className="rounded-3xl bg-tuki-night-soft p-6"
          >
            <h2 className="text-2xl text-tuki-cream">
              {h.titulo}
            </h2>

            <p className="text-tuki-cream/60">
              {h.descripcion}
            </p>

            <p
  className={`mt-2 text-sm font-bold ${
    h.activo
      ? "text-green-500"
      : "text-red-500"
  }`}
>
  {h.activo
    ? "● ACTIVO"
    : "● INACTIVO"}
</p>

            <button
  onClick={() =>
    activar(h.id)
  }
  disabled={h.activo}
  className="
    mt-4
    rounded-xl
    bg-tuki-lime
    px-4
    py-2
    disabled:opacity-50
  "
>
  {h.activo
    ? "Activo"
    : "Activar"}
</button>
          </div>
        ))}
      </div>
    </>
  );
}