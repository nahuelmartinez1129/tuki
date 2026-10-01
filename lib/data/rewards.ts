/**
 * Datos de presentación y tipos compartidos.
 *
 * Los premios de la ruleta YA NO se administran desde este archivo.
 * La fuente de verdad de los premios es PostgreSQL, mediante:
 *
 * /api/admin/roulette
 * /api/roulette/prizes
 *
 * Este archivo solamente conserva información visual
 * para que la ruleta pueda mostrar emoji y color.
 */

export interface HappyHourPromo {
  id: string;
  emoji: string;
  label: string;
  /** Duración mockeada en segundos, arranca cada vez que carga la Home. */
  durationSeconds: number;
}

// Simula la promo "activa" del momento.
export const CURRENT_HAPPY_HOUR: HappyHourPromo | null = {
  id: "envio-gratis",
  emoji: "🔥",
  label: "ENVÍO GRATIS",
  durationSeconds: 14 * 60 + 52,
};

/**
 * Premio de ruleta recibido desde la base de datos.
 *
 * Los campos nombre, tipo, valor, probabilidad y activo
 * vienen directamente del modelo Premio de Prisma.
 */
export interface RoulettePrize {
  id: string;
  nombre: string;
  tipo: string;
  valor: number | null;
  probabilidad: number;
  activo: boolean;
}

/**
 * Información visual de cada tipo de premio.
 *
 * IMPORTANTE:
 * Esto NO controla qué premios existen.
 * Solamente define cómo se ven.
 */
export const ROULETTE_PRIZE_STYLES: Record<
  string,
  {
    color: string;
    emoji: string;
    isBlank?: boolean;
  }
> = {
  DESCUENTO: {
    color: "#C6DB00",
    emoji: "🏷️",
  },

  ENVIO_GRATIS: {
    color: "#1BA091",
    emoji: "🚀",
  },

  ALFAJOR: {
    color: "#F5E57A",
    emoji: "🍫",
  },

  GOMITAS: {
    color: "#80AD7E",
    emoji: "🍬",
  },

  SIN_PREMIO: {
    color: "#12312E",
    emoji: "🌙",
    isBlank: true,
  },
};

/**
 * Estilo por defecto para premios nuevos creados
 * desde el panel de administración.
 */
export const DEFAULT_ROULETTE_PRIZE_STYLE = {
  color: "#1BA091",
  emoji: "🎁",
};

/**
 * Devuelve la información visual correspondiente
 * al tipo de premio.
 */
export function getRoulettePrizeStyle(tipo: string) {
  return (
    ROULETTE_PRIZE_STYLES[tipo] ??
    DEFAULT_ROULETTE_PRIZE_STYLE
  );
}

// Tiempo de espera hasta poder volver a girar.
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
    description:
      "Para una noche tranquila de antojos chiquitos.",
  },
  {
    id: "mediana",
    size: "Mediana",
    price: 5400,
    itemsRange: "4 a 5 productos",
    description:
      "La combinación perfecta de chocolates para cualquier antojo nocturno.",
  },
  {
    id: "xl",
    size: "XL",
    price: 7100,
    itemsRange: "6 a 7 productos",
    description:
      "Para compartir o para una madrugada larga.",
  },
];

export const MYSTERY_BOX_POSSIBLE_ITEMS = [
  "Gomitas",
  "Alfajores",
  "Chocolates",
];