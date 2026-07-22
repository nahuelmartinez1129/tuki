/**
 * Datos mockeados de recompensas. En el próximo sprint esto se reemplaza
 * por lecturas a /api/happy-hour, /api/roulette y /api/mystery-box (Prisma +
 * PostgreSQL); ningún componente visual debería cambiar cuando eso pase,
 * porque todos consumen estas mismas formas de datos.
 */

export interface HappyHourPromo {
  id: string;
  emoji: string;
  label: string;
  /** Duración mockeada en segundos, arranca cada vez que carga la Home. */
  durationSeconds: number;
}

// Simula la promo "activa" del momento. Rotar este índice (o conectarlo
// a la hora real) es el único cambio necesario para variar la promo.
export const CURRENT_HAPPY_HOUR: HappyHourPromo | null = {
  id: "envio-gratis",
  emoji: "🔥",
  label: "ENVÍO GRATIS",
  durationSeconds: 14 * 60 + 52,
};

export interface RoulettePrize {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  emoji: string;
  isBlank?: boolean;
}

export const ROULETTE_PRIZES: RoulettePrize[] = [
  { id: "DESCUENTO", label: "10% OFF", shortLabel: "10% OFF", color: "#C6DB00", emoji: "🏷️" },
  { id: "ENVIO_GRATIS", label: "Envío gratis", shortLabel: "Envío gratis", color: "#1BA091", emoji: "🚀" },
  { id: "CUPON_1500", label: "Cupón $1500", shortLabel: "$1500", color: "#F5E57A", emoji: "🎟️" },
  { id: "GOMITAS", label: "Caramelos Gratis", shortLabel: "Caramelos", color: "#80AD7E", emoji: "🍬" },
  { id: "CAJA_10", label: "Caja Misteriosa 10% OFF", shortLabel: "Caja -10%", color: "#C6DB00", emoji: "🎁" },
  { id: "SIN_PREMIO", label: "Sin premio, ¡mejor suerte mañana!", shortLabel: "Sin premio", color: "#12312E", emoji: "🌙", isBlank: true },
];

// Tiempo mock de espera hasta poder volver a girar (24hs simuladas).
export const ROULETTE_COOLDOWN_SECONDS =
  24 * 60 * 60;

export interface MysteryBoxOption {
  id: string;
  size: string;
  price: number;
  itemsRange: string;
  description: string;
}

export const MYSTERY_BOX_OPTIONS: MysteryBoxOption[] = [
  {
    id: "mini",
    size: "Mini",
    price: 2500,
    itemsRange: "3 a 4 productos",
    description: "Para una noche tranquila de antojos chiquitos.",
  },
  {
    id: "mediana",
    size: "Mediana",
    price: 5400,
    itemsRange: "4 a 5 productos",
    description: "La combinación perfecta de chocolates para cualquier antojo nocturno."
  },
  {
    id: "xl",
    size: "XL",
    price: 7100,
    itemsRange: "6 a 7 productos",
    description: "Para compartir o para una madrugada larga.",
  },
];

export const MYSTERY_BOX_POSSIBLE_ITEMS = [
  "Gomitas",
  "Alfajores",
  "Chocolates",
  
];
