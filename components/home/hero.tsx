import { Moon, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-tuki-night bg-night-texture pb-16 pt-10 sm:pb-24 sm:pt-14"
    >
      {/* Estrellitas decorativas — refuerzan la identidad "nocturna" */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[12%] top-[18%] h-1.5 w-1.5 animate-twinkle rounded-full bg-tuki-yellow" />
        <span className="absolute left-[78%] top-[12%] h-1 w-1 animate-twinkle rounded-full bg-tuki-cream [animation-delay:0.6s]" />
        <span className="absolute left-[85%] top-[38%] h-2 w-2 animate-twinkle rounded-full bg-tuki-lime [animation-delay:1.1s]" />
        <span className="absolute left-[6%] top-[55%] h-1 w-1 animate-twinkle rounded-full bg-tuki-cream [animation-delay:1.6s]" />
      </div>

      <div className="container relative flex flex-col items-center text-center">
        <div className="mb-5 inline-flex animate-pop items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10">
          <Moon className="h-4 w-4 text-tuki-yellow" />
          <span className="font-display text-xs font-semibold text-tuki-cream/90 sm:text-sm">
            Tu kiosco, en moto.
          </span>
        </div>

        <h1 className="max-w-lg font-display text-4xl font-extrabold leading-[1.05] text-tuki-cream sm:max-w-2xl sm:text-6xl">
          ¿Pintó algo{" "}
          <span className="relative inline-block text-tuki-lime">
            dulce
            <svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 200 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 9C40 2 160 2 198 9"
                stroke="#F5E57A"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          ?
        </h1>

        <p className="mt-5 max-w-sm font-display text-lg font-semibold text-tuki-cream/80 sm:max-w-md sm:text-xl">
          La noche pide Tuki. Antojos dulces en la puerta de tu casa,
          en minutos.
        </p>

    <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row">
  <Button size="lg" variant="lime" asChild>
    <a href="#destacados">
      <Zap className="h-5 w-5" strokeWidth={2.5} />
      Ver Menú
    </a>
  </Button>

  <Button size="lg" variant="outline" asChild>
    <Link href="/ruleta">
      🎡 Girar Ruleta
    </Link>
  </Button>
</div>

        {/* Tarjeta flotante: elemento de identidad que se repite en toda la Home */}
        <div className="relative mt-14 w-full max-w-xs animate-float-slow sm:max-w-sm">
          <div className="flex items-center gap-4 rounded-3xl bg-tuki-night-soft p-4 shadow-soft-lg ring-1 ring-white/10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-tuki-yellow shadow-glow">
              <span className="text-2xl">🎰</span>
            </div>
            <div className="text-left">
              <p className="font-display text-sm font-bold text-tuki-cream">
                Tenés una recompensa esperándote
              </p>
              <p className="text-xs text-tuki-cream/60">
                Girás la ruleta 🎡.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
