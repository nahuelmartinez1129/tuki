"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RegisterModal({
  open,
  onClose,
}: Props) {
  const [nombre, setNombre] =
    useState("");

  const [phone, setPhone] =
    useState("");

  async function handleSubmit() {
    const anonymousId =
      localStorage.getItem(
        "tuki_user_id"
      );

    const response = await fetch(
      "/api/register",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          nombre,
          phone,
          anonymousId,
        }),
      }
    );

    if (!response.ok) {
      alert(
        "Error al registrarte."
      );
      return;
    }

    localStorage.setItem(
      "tuki_user_name",
      nombre
    );

    localStorage.setItem(
      "tuki_user_phone",
      phone
    );

    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-3xl bg-tuki-night-soft p-6">
        <h2 className="text-2xl font-bold text-tuki-lime">
          ¡Bienvenido a TUKI!
        </h2>

        <p className="mt-3 text-sm text-tuki-cream/70">
          Registrate gratis y obtené:
        </p>

        <ul className="mt-3 space-y-1 text-sm text-tuki-cream">
          <li>🎰 Ruleta diaria</li>
          <li>🎁 Premios exclusivos</li>
          <li>🔥 Happy Hour</li>
          <li>📦 Historial de pedidos</li>
        </ul>

        <input
          className="
    mt-5
    w-full
    rounded-xl
    bg-white
    p-3
    text-black
    placeholder:text-gray-500
  "
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) =>
            setNombre(
              e.target.value
            )
          }
        />

        <input
          className="
    mt-3
    w-full
    rounded-xl
    bg-white
    p-3
    text-black
    placeholder:text-gray-500
  "
          placeholder="Telefono"
          value={phone}
          onChange={(e) =>
            setPhone(
              e.target.value
            )
          }
        />

        <button
          onClick={handleSubmit}
          className="mt-5 w-full rounded-xl bg-tuki-lime p-3 font-bold"
        >
          Crear cuenta
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full text-sm text-tuki-cream/60"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}