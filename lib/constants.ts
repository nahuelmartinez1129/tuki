/**
 * Constantes globales de la marca TUKI.
 * Centralizar acá evita "magic strings" repetidos en los componentes
 * y facilita ajustar tono de marca / datos de contacto a futuro.
 */

export const BRAND = {
  name: "TUKI",
  tagline: "La noche pide Tuki.",
  whatsappNumber: "5491100000000", // TODO: reemplazar por número real
} as const;

export const BRAND_MESSAGES = {
  heroQuestion: "¿Pintó algo dulce?",
  heroSub: "La noche pide Tuki.",
  rewardWaiting: "Tenés una recompensa esperándote 🎁",
  rouletteCountdown: "Girás la ruleta en 2 horas",
  freeShippingWon: "¡Ganaste envío gratis!",
  dontSleepHungry: "No te vayas a dormir con ganas.",
} as const;

export function buildWhatsAppLink(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encoded}`;
}
