import { Gift } from "lucide-react";

export function MysteryBoxSection() {
  return (
    <section
      id="caja-misteriosa-preview"
      className="relative overflow-hidden bg-tuki-night-soft py-16"
    >
      <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-tuki-lime/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-tuki-yellow/10 blur-3xl" />

      <div className="container relative flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tuki-yellow shadow-glow">
          <Gift
            className="h-7 w-7 text-tuki-night"
            strokeWidth={2.5}
          />
        </span>

        <h2 className="mt-4 font-display text-2xl font-extrabold text-tuki-cream sm:text-3xl">
          🎁 CAJA MISTERIOSA
        </h2>

        <p className="mt-2 font-display text-sm font-bold text-tuki-lime sm:text-base">
          Próximamente
        </p>

        <p className="mt-3 max-w-sm text-sm text-tuki-cream/70">
          Estamos preparando una sorpresa especial para vos.
        </p>

        <div className="mt-8 rounded-3xl bg-tuki-night px-8 py-6 shadow-soft ring-1 ring-white/5">
          <p className="font-display text-lg font-extrabold text-tuki-cream">
            🌙 MUY PRONTO
          </p>

          <p className="mt-2 text-sm text-tuki-cream/50">
            Pronto vas a poder pedir tu caja misteriosa...
          </p>
        </div>
      </div>
    </section>
  );
}