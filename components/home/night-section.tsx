import { Clock, Gift, Truck } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Envío nocturno",
    desc: "Mientras Tuki está abierto, llevamos tu pedido.",
  },
  {
    icon: Gift,
    title: "Recompensas todo el tiempo",
    desc: "Ruleta diaria y Hora Tuki.",
  },
  {
    icon: Clock,
    title: "Rápido de verdad",
    desc: "De la puerta a tu antojo en minutos.",
  },
];

export function NightSection() {
  return (
    <section
      id="noche"
      className="relative overflow-hidden bg-tuki-night bg-night-texture py-16"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-tuki-turquoise/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-tuki-lime/10 blur-3xl" />

      <div className="container relative grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-tuki-lime">
            La noche pide Tuki
          </p>
          <h2 className="mt-2 max-w-md font-display text-3xl font-extrabold leading-tight text-tuki-cream sm:text-4xl">
            Antojo a cualquier hora.
          </h2>
          <p className="mt-3 max-w-md text-sm text-tuki-cream/70 sm:text-base">
            No te vayas a dormir con ganas. Girá la ruleta, gana tu premio, suma tus productos y pedi mientras el resto de la ciudad duerme.
          </p>

          <ul className="mt-8 flex flex-col gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Icon className="h-5 w-5 text-tuki-yellow" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-tuki-cream">
                    {title}
                  </p>
                  <p className="text-xs text-tuki-cream/60 sm:text-sm">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Luna + ruleta: eco visual del Hero, refuerza identidad nocturna/reward */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
            <div className="absolute inset-0 animate-float-slower rounded-full bg-gradient-to-br from-tuki-yellow to-tuki-lime opacity-90 shadow-glow-turquoise" />
            <div className="absolute h-16 w-16 rounded-full bg-tuki-night/90 blur-[1px] left-10 top-8 sm:left-14 sm:top-10" />
            <div className="absolute h-8 w-8 rounded-full bg-tuki-night/70 right-14 bottom-16" />

            <div className="relative flex animate-wiggle flex-col items-center gap-1 rounded-3xl bg-tuki-night px-5 py-4 shadow-soft-lg ring-1 ring-white/10">
              <span className="text-3xl">🎡</span>
              <span className="font-display text-xs font-bold text-tuki-cream">
                Ruleta diaria
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
