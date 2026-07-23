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

  const [
    welcomeMessage,
    setWelcomeMessage,
  ] = useState("");

  async function handleSubmit() {
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
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      alert(
        "Error al registrarte."
      );
      return;
    }

    localStorage.setItem(
      "tuki_user_name",
      data.nombre
    );

    localStorage.setItem(
      "tuki_user_phone",
      data.phone
    );

    if (!data.isNewUser) {
      setWelcomeMessage(
        `¡Qué bueno verte de nuevo, ${data.nombre}!`
      );

      setTimeout(() => {
        onClose();
        setWelcomeMessage(
          ""
        );
      }, 2500);

      return;
    }

    onClose();
  }

  if (
    !open &&
    !welcomeMessage
  )
    return null;

  return (
    <>
      {welcomeMessage && (
        <div className="fixed left-1/2 top-6 z-[100] -translate-x-1/2">
          <div className="rounded-2xl bg-tuki-lime px-6 py-4 shadow-2xl">
            <p className="font-display text-lg font-bold text-tuki-night">
              🍬 {welcomeMessage}
            </p>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-3xl bg-tuki-night-soft p-6">
            <h2 className="text-2xl font-bold text-tuki-lime">
              ¡Bienvenido a TUKI!
            </h2>

            <p className="mt-3 text-sm text-tuki-cream/70">
              Registrate o inicia sesión gratis y obtené:
            </p>

            <ul className="mt-3 space-y-1 text-sm text-tuki-cream">
              <li>🎰 Ruleta diaria</li>
              <li>🎁 Premios exclusivos</li>
              <li>🔥 Happy Hour</li>
            </ul>

            <input
              className="mt-5 w-full rounded-xl bg-white p-3 text-black placeholder:text-gray-500"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) =>
                setNombre(
                  e.target.value
                )
              }
            />

            <input
              className="mt-3 w-full rounded-xl bg-white p-3 text-black placeholder:text-gray-500"
              placeholder="Telefono"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
            />

            <button
              onClick={
                handleSubmit
              }
              className="mt-5 w-full rounded-xl bg-tuki-lime p-3 font-bold"
            >
              Continuar
            </button>

            <button
              onClick={onClose}
              className="mt-3 w-full text-sm text-tuki-cream/60"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}
    </>
  );
}