"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    const response = await fetch(
      "/api/admin/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    if (!response.ok) {
      setError(
        "Usuario o contraseña incorrectos."
      );

      return;
    }

    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-tuki-night px-4">
      <div className="w-full max-w-md rounded-3xl bg-tuki-night-soft p-8 shadow-soft-lg">
        <h1 className="text-center font-display text-4xl font-extrabold text-tuki-cream">
          TUKI Admin
        </h1>

        <p className="mt-2 text-center text-tuki-cream/60">
          Ingresá para administrar el local.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm text-tuki-cream">
              Usuario
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-tuki-night p-3 text-tuki-cream outline-none"
              placeholder="matias"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-tuki-cream">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-tuki-night p-3 text-tuki-cream outline-none"
              placeholder="********"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="lime"
            size="lg"
            className="w-full"
          >
            Ingresar
          </Button>
        </form>
      </div>
    </main>
  );
}