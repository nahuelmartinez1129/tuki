"use client";

import { Sparkles } from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

export function HappyHour() {
const [happyHour, setHappyHour] =
  useState<any>(null);

useEffect(() => {
  async function load() {
    const response = await fetch(
      "/api/happy-hour"
    );

    const data =
      await response.json();

    setHappyHour(data);
  }

  load();

  const interval =
    setInterval(load, 2000);

  return () =>
    clearInterval(interval);
}, []);

const isActive =
  happyHour !== null;

  return (
    <div
      className={`sticky top-16 z-40 overflow-hidden border-b border-white/5 py-2 text-center transition-colors ${
       happyHour
  ? "bg-tuki-turquoise"
  : "bg-tuki-night-soft"
      }`}
    >
      <div className="container flex items-center justify-center gap-2 px-4">
       {happyHour ? (
  <p className="flex flex-wrap items-center justify-center gap-1.5 font-display text-xs font-bold text-tuki-cream sm:text-sm">
    <span>🔥</span>

    <span>
      {happyHour.titulo}
    </span>

    <span className="text-tuki-cream/60">
      ·
    </span>

    <span>
      {happyHour.descripcion}
    </span>
  </p>
) : (
          <p className="flex items-center justify-center gap-1.5 font-display text-xs font-bold text-tuki-cream/80 sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 text-tuki-yellow" />
            Girá la ruleta y descubrí tu premio.
          </p>
        )}
      </div>
    </div>
  );
}
