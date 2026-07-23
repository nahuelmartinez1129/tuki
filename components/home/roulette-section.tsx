"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RouletteWheel } from "@/components/roulette/roulette-wheel";
import { RouletteResultModal } from "@/components/roulette/roulette-result-modal";

import {
  ROULETTE_PRIZES,
  type RoulettePrize,
} from "@/lib/data/rewards";



import { useUser } from "@/hooks/useUser";
import { RegisterModal }
from "@/components/auth/register-modal";
const SEGMENT_ANGLE = 360 / ROULETTE_PRIZES.length;
const SPIN_DURATION_MS = 4200;



export function RouletteSection() {
    
    const { phone } =
  useUser();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  
const [showRegisterModal, setShowRegisterModal] =
  useState(false);
  const [result, setResult] = useState<RoulettePrize | null>(null);

const [canSpin, setCanSpin] =
  useState(false);

  const [loading, setLoading] =
  useState(false);
  useEffect(() => {
  if (!phone) {
    return;
  }

  setLoading(true);

  async function checkRoulette() {
    const response = await fetch(
      `/api/roulette?phone=${phone}`
    );

    const data =
      await response.json();

    console.log(
      "PHONE:",
      phone
    );

    console.log(
      "DATA:",
      data
    );

    setCanSpin(
      data.canSpin
    );

    setLoading(false);
  }

  checkRoulette();
}, [phone]);


async function handleSpin() {
  const phone =
  localStorage.getItem(
    "tuki_user_phone"
  );

if (!phone) {
  setShowRegisterModal(
    true
  );

  return;
}
  const response = await fetch(
    "/api/roulette/spin",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        
        phone,
      }),
    }
  );

  if (!response.ok) {
    alert(
      "Ya giraste la ruleta hoy. Volvé mañana."
    );

    return;
  }

  const data = await response.json();

  const prize = data.premio;
const prizeIndex =
  ROULETTE_PRIZES.findIndex(
    (p) => p.id === prize.tipo
  );

    

    setCanSpin(false);

    

    const targetSegmentCenter =
      prizeIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;

    const extraSpins = 6 * 360;

    const finalRotation =
      rotation +
      extraSpins +
      (360 - targetSegmentCenter) -
      (rotation % 360);

    setIsSpinning(true);
    setRotation(finalRotation);

    window.setTimeout(() => {
  setIsSpinning(false);
  setResult(prize);
}, SPIN_DURATION_MS);
  }

  return (
    <section className="overflow-x-hidden bg-tuki-night bg-night-texture py-20">
      <div className="container flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10">
          <Sparkles className="h-4 w-4 text-tuki-yellow" />

          <span className="font-display text-xs font-semibold text-tuki-cream/90">
            Una vuelta por día
          </span>
        </span>

        <h2 className="mt-5 font-display text-3xl font-extrabold text-tuki-cream sm:text-4xl">
          RULETA TUKI
        </h2>

        <p className="mt-2 max-w-sm text-sm text-tuki-cream/70">
          Girá una vez por día y descubrí qué tiene preparada la noche para
          vos.
        </p>

        <div className="mt-10">
          <RouletteWheel
            rotation={rotation}
            isSpinning={isSpinning}
          />
        </div>

        <div className="mt-10 w-full max-w-xs">
  {loading ? (
    <p className="text-sm text-tuki-cream/60">
      Cargando...
    </p>
  ) : canSpin ? (
    <Button
      size="lg"
      variant="lime"
      onClick={handleSpin}
      disabled={isSpinning}
      className="w-full"
    >
      {isSpinning ? "Girando..." : "🎰 Girar"}
    </Button>
  ) : (
    <div className="rounded-2xl bg-white/5 px-4 py-3">
  <p className="font-display text-lg font-extrabold text-tuki-yellow">
    🎰 Próxima ruleta
  </p>

  <p className="mt-1 text-sm text-tuki-cream">
    Mañana a las 21:00
  </p>
</div>
  )}
</div>

        <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-3">
          {ROULETTE_PRIZES.map((prize) => (
            <div
              key={prize.id}
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-left"
            >
              <span className="text-base">
                {prize.emoji}
              </span>

              <span className="text-xs font-semibold text-tuki-cream/80">
                {prize.shortLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {result && (
        <RouletteResultModal
          prize={result}
          onClose={() => setResult(null)}
        />
      )}
      <RegisterModal
  open={showRegisterModal}
  onClose={() =>
    setShowRegisterModal(
      false
    )
  }
/>
    </section>
  );
}