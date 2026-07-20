const PROMO_ITEMS = [
  "¡Hora Tuki de 21:00 a 22:30 hs! 🚀",
  "Tenés una recompensa esperándote 🎁",
  "Girá la ruleta 🎰",
  "No te vayas a dormir con ganas 🌙",
  "Combos para elegir🍫",
];

export function PromoBanner() {
  const items = [...PROMO_ITEMS, ...PROMO_ITEMS];

  return (
    <div className="overflow-hidden border-y-2 border-tuki-night bg-tuki-lime py-2.5">
      <div className="flex w-max animate-marquee gap-8">
        {items.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 whitespace-nowrap font-display text-sm font-bold text-tuki-night"
          >
            {item}
            <span aria-hidden className="text-tuki-night/40">
              •
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
