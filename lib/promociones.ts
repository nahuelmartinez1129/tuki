/**
 * ==========================================
 * PROMOCIONES TUKI
 * ==========================================
 *
 * Reglas económicas de todos los beneficios
 * (bienvenida, cupones, ruleta y Happy Hour).
 *
 * Lo usan el checkout (para mostrar el total)
 * y /api/pedidos (para calcular el total real),
 * así los dos siempre dan el mismo resultado.
 *
 * Regla principal: UN SOLO BENEFICIO POR PEDIDO.
 */

export const REGLAS = {
  // Bono de bienvenida (primera compra del teléfono)
  bienvenidaDescuento: 1000,
  bienvenidaMinimo: 8000,

  // Premios de la ruleta
  premioVigenciaHoras: 48,
  premioMinimo: 7000,
  premioEnvioGratisMinimo: 10000,
  // El alfajor a elección cuesta hasta $1.249:
  // con $7.000 de compra se pierde plata.
  premioAlfajorMinimo: 10000,
  premioDescuentoFijo: 500,

  // Happy Hour
  happyHourRegaloMinimo: 6000,
  happyHourDescuentoMinimo: 8000,
  happyHourDescuentoMaxPorcentaje: 10,
  happyHourEnvioGratisMinimo: 12000,

  // Tope general de cualquier descuento sobre productos
  descuentoMaxPorcentaje: 15,
} as const;

/*
 * Valor de venta de los regalos, solo para
 * comparar beneficios entre sí.
 */
const VALOR_REGALO: Record<string, number> = {
  GUAYMALLEN: 600,
  GOMITAS: 1000,
  ALFAJOR: 2200,
};

const TEXTO_REGALO: Record<string, string> = {
  GUAYMALLEN: "Alfajor Guaymallén de regalo",
  GOMITAS: "Gomitas de regalo (dientitos o moritas)",
  ALFAJOR: "Alfajor de regalo (a elección, hasta Jorgelín)",
};

/*
 * Compra mínima para usar cada premio de la ruleta.
 */
export function minimoPremioRuleta(tipo: string) {
  if (tipo === "ENVIO_GRATIS") return REGLAS.premioEnvioGratisMinimo;
  if (tipo === "ALFAJOR") return REGLAS.premioAlfajorMinimo;
  return REGLAS.premioMinimo;
}

export type OrigenBeneficio =
  | "CUPON"
  | "BIENVENIDA"
  | "RULETA"
  | "HAPPY_HOUR";

export type PremioRuleta = {
  tipo: string;
  nombre?: string | null;
  valor?: number | null;
};

export type HappyHourActivo = {
  tipo: string;
  titulo: string;
  valor?: number | null;
};

export type CuponValido = {
  codigo: string;
  tipo: string; // FIJO | PORCENTAJE
  valor: number | null;
  compraMinima: number;
  topeDescuento: number | null;
};

export type EntradaBeneficios = {
  subtotal: number;
  envio: number;
  // Subtotal de las Cajas Misteriosas del carrito
  subtotalCajas: number;
  primeraCompra: boolean;
  premio: PremioRuleta | null;
  happyHour: HappyHourActivo | null;
  cupon: CuponValido | null;
};

export type Beneficio = {
  origen: OrigenBeneficio;
  titulo: string;
  descuento: number;
  envioGratis: boolean;
  regalo: string | null;
  // Ahorro total para el cliente (para elegir el mejor)
  ahorro: number;
  aplica: boolean;
  // Si no aplica: cuánto le falta o por qué
  motivo: string | null;
};

export type ResultadoBeneficios = {
  candidatos: Beneficio[];
  elegido: Beneficio | null;
  descuento: number;
  envio: number;
};

function formatear(monto: number) {
  return `$${monto.toLocaleString("es-AR")}`;
}

function topeGeneral(subtotal: number) {
  return Math.floor(
    subtotal *
      (REGLAS.descuentoMaxPorcentaje / 100)
  );
}

/*
 * Arma un beneficio verificando el mínimo.
 */
function crear(
  entrada: EntradaBeneficios,
  datos: {
    origen: OrigenBeneficio;
    titulo: string;
    minimo: number;
    descuento?: number;
    envioGratis?: boolean;
    regalo?: string | null;
    valorRegalo?: number;
  }
): Beneficio {
  const descuento = Math.min(
    Math.round(datos.descuento ?? 0),
    entrada.subtotal
  );

  const envioGratis =
    datos.envioGratis ?? false;

  const aplica =
    entrada.subtotal >= datos.minimo;

  return {
    origen: datos.origen,
    titulo: datos.titulo,
    descuento,
    envioGratis,
    regalo: datos.regalo ?? null,
    ahorro:
      descuento +
      (envioGratis ? entrada.envio : 0) +
      (datos.valorRegalo ?? 0),
    aplica,
    motivo: aplica
      ? null
      : `Sumá ${formatear(
          datos.minimo - entrada.subtotal
        )} más para usarlo (mínimo ${formatear(
          datos.minimo
        )}).`,
  };
}

/*
 * ==========================================
 * BENEFICIO DE LA RULETA
 * ==========================================
 */
function beneficioRuleta(
  entrada: EntradaBeneficios,
  premio: PremioRuleta
): Beneficio | null {
  const base = {
    origen: "RULETA" as const,
    // El prefijo "Ruleta:" permite saber qué
    // pedidos usaron un premio de la ruleta.
    titulo: `Ruleta: ${premio.nombre || "premio"}`,
  };

  switch (premio.tipo) {
    case "ENVIO_GRATIS":
      return crear(entrada, {
        ...base,
        minimo: REGLAS.premioEnvioGratisMinimo,
        envioGratis: true,
      });

    case "DESCUENTO":
      return crear(entrada, {
        ...base,
        minimo: REGLAS.premioMinimo,
        descuento:
          premio.valor && premio.valor > 0
            ? premio.valor
            : REGLAS.premioDescuentoFijo,
      });

    case "CAJA_10":
      return crear(entrada, {
        ...base,
        minimo: REGLAS.premioMinimo,
        descuento: entrada.subtotalCajas * 0.1,
      });

    case "GUAYMALLEN":
    case "GOMITAS":
    case "ALFAJOR":
      return crear(entrada, {
        ...base,
        minimo: minimoPremioRuleta(premio.tipo),
        regalo: TEXTO_REGALO[premio.tipo],
        valorRegalo: VALOR_REGALO[premio.tipo],
      });

    default:
      // SIN_PREMIO, VOLVER_A_GIRAR o desconocido
      return null;
  }
}

/*
 * ==========================================
 * BENEFICIO DEL HAPPY HOUR
 * ==========================================
 */
function beneficioHappyHour(
  entrada: EntradaBeneficios,
  happyHour: HappyHourActivo
): Beneficio | null {
  const base = {
    origen: "HAPPY_HOUR" as const,
    titulo: `Happy Hour: ${happyHour.titulo}`,
  };

  switch (happyHour.tipo) {
    case "ENVIO_GRATIS":
      return crear(entrada, {
        ...base,
        minimo: REGLAS.happyHourEnvioGratisMinimo,
        envioGratis: true,
      });

    case "DESCUENTO": {
      const porcentaje = Math.min(
        happyHour.valor ?? 0,
        REGLAS.happyHourDescuentoMaxPorcentaje
      );

      return crear(entrada, {
        ...base,
        minimo: REGLAS.happyHourDescuentoMinimo,
        descuento:
          entrada.subtotal * (porcentaje / 100),
      });
    }

    case "CAJA_10": {
      const porcentaje = Math.min(
        happyHour.valor ?? 10,
        REGLAS.happyHourDescuentoMaxPorcentaje
      );

      return crear(entrada, {
        ...base,
        minimo: 0,
        descuento:
          entrada.subtotalCajas *
          (porcentaje / 100),
      });
    }

    case "GUAYMALLEN":
    case "GOMITAS":
      return crear(entrada, {
        ...base,
        minimo: REGLAS.happyHourRegaloMinimo,
        regalo: TEXTO_REGALO[happyHour.tipo],
        valorRegalo: VALOR_REGALO[happyHour.tipo],
      });

    default:
      return null;
  }
}

/*
 * ==========================================
 * BENEFICIO DEL CUPÓN
 * ==========================================
 */
function beneficioCupon(
  entrada: EntradaBeneficios,
  cupon: CuponValido
): Beneficio {
  let descuento =
    cupon.tipo === "PORCENTAJE"
      ? entrada.subtotal *
        (Math.min(
          cupon.valor ?? 0,
          REGLAS.descuentoMaxPorcentaje
        ) /
          100)
      : cupon.valor ?? 0;

  if (cupon.topeDescuento) {
    descuento = Math.min(
      descuento,
      cupon.topeDescuento
    );
  }

  return crear(entrada, {
    origen: "CUPON",
    titulo: `Cupón ${cupon.codigo}`,
    minimo: cupon.compraMinima,
    descuento: Math.min(
      descuento,
      topeGeneral(entrada.subtotal)
    ),
  });
}

/*
 * ==========================================
 * ELEGIR BENEFICIO
 * ==========================================
 *
 * Se aplica automáticamente el beneficio que
 * más le conviene al cliente entre los
 * disponibles (incluido el cupón que cargó).
 */
export function calcularBeneficios(
  entrada: EntradaBeneficios
): ResultadoBeneficios {
  const candidatos: Beneficio[] = [];

  if (entrada.cupon) {
    candidatos.push(
      beneficioCupon(entrada, entrada.cupon)
    );
  }

  if (entrada.primeraCompra) {
    candidatos.push(
      crear(entrada, {
        origen: "BIENVENIDA",
        titulo: "Bono de bienvenida",
        minimo: REGLAS.bienvenidaMinimo,
        descuento: REGLAS.bienvenidaDescuento,
      })
    );
  }

  if (entrada.premio) {
    const beneficio = beneficioRuleta(
      entrada,
      entrada.premio
    );

    if (beneficio) candidatos.push(beneficio);
  }

  if (entrada.happyHour) {
    const beneficio = beneficioHappyHour(
      entrada,
      entrada.happyHour
    );

    if (beneficio) candidatos.push(beneficio);
  }

  const aplicables = candidatos.filter(
    (c) => c.aplica
  );

  /*
   * Gana el que más ahorra. En caso de
   * empate, el cupón (lo eligió el cliente).
   */
  const elegido =
    aplicables.reduce<Beneficio | null>(
      (mejor, actual) =>
        !mejor ||
        actual.ahorro > mejor.ahorro ||
        (actual.ahorro === mejor.ahorro &&
          actual.origen === "CUPON")
          ? actual
          : mejor,
      null
    );

  return {
    candidatos,
    elegido,
    descuento: elegido?.descuento ?? 0,
    envio: elegido?.envioGratis
      ? 0
      : entrada.envio,
  };
}

/*
 * ==========================================
 * VIGENCIA DEL PREMIO DE LA RULETA
 * ==========================================
 */
export function premioVigente(
  createdAt: Date | string,
  ahora = new Date()
) {
  const vence =
    new Date(createdAt).getTime() +
    REGLAS.premioVigenciaHoras * 60 * 60 * 1000;

  return ahora.getTime() < vence;
}

/*
 * Tipos de la ruleta que no son un premio
 * canjeable.
 */
export const PREMIOS_SIN_BENEFICIO = [
  "SIN_PREMIO",
  "VOLVER_A_GIRAR",
];

/*
 * Una Caja Misteriosa se reconoce por la
 * categoría o por el nombre.
 */
export function esCajaMisteriosa(producto: {
  name: string;
  category?: string | null;
}) {
  return (
    producto.category === "misterioso" ||
    producto.name.toLowerCase().includes("caja")
  );
}
