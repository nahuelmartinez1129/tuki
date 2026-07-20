"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, Moon } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const SCHEDULE = [
  { day: "Domingo a Jueves", hours: "19:00 – 02:00" },
  { day: "Viernes y Sábado", hours: "19:00 – 04:00" },
];

export default function CerradoPage() {
  const [notified, setNotified] = useState(false);

  return (
    <>
      <Navbar />
      <main className="flex min-h-[80vh] flex-col items-center justify-center overflow-x-hidden bg-tuki-night bg-night-texture px-4 py-16 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-tuki-night-soft shadow-soft-lg ring-1 ring-white/10">
          <Moon className="h-12 w-12 text-tuki-yellow" />
          <span className="absolute -right-1 -top-1 h-4 w-4 animate-twinkle rounded-full bg-tuki-lime" />
        </div>

        <h1 className="mt-6 font-display text-3xl font-extrabold text-tuki-cream sm:text-4xl">
          Volvemos mañana.
        </h1>
        <p className="mt-2 max-w-xs text-sm text-tuki-cream/70 sm:max-w-sm">
          TUKI está descansando. Nos vemos esta noche.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-2 rounded-3xl bg-tuki-night-soft p-5 shadow-soft ring-1 ring-white/5">
          {SCHEDULE.map((row) => (
            <div
              key={row.day}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-tuki-cream/60">{row.day}</span>
              <span className="font-display font-bold text-tuki-cream">
                {row.hours}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          {notified ? (
            <p className="flex items-center gap-2 font-display text-sm font-bold text-tuki-lime">
              <Check className="h-4 w-4" />
              ¡Listo! Te avisamos cuando abramos.
            </p>
          ) : (
            <Button
              size="lg"
              variant="lime"
              onClick={() => setNotified(true)}
            >
              <Bell className="h-4 w-4" />
              Avisame cuando abran
            </Button>
          )}
        </div>

        <Link
          href="/"
          className="mt-6 font-display text-xs font-semibold text-tuki-cream/50 underline-offset-4 hover:text-tuki-lime hover:underline"
        >
          Volver al inicio
        </Link>
      </main>
      <Footer />
    </>
  );
}
