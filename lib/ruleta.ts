/**
 * ==========================================
 * HORARIO DE LA RULETA
 * ==========================================
 *
 * Cada usuario puede girar UNA VEZ POR DÍA.
 * Después de girar, la ruleta se vuelve a
 * habilitar a las 21:00 (Argentina) del día
 * siguiente al giro, sin importar a qué hora
 * giró.
 *
 * Los giros de madrugada (antes de las 06:00)
 * cuentan como parte de la noche anterior.
 *
 * Ejemplos:
 * - Gira el lunes 20:30 → vuelve el martes 21:00.
 * - Gira el lunes 21:05 → vuelve el martes 21:00.
 * - Gira el martes 00:30 (madrugada, cuenta
 *   como la noche del lunes) → vuelve el
 *   martes 21:00.
 * - Gira el martes 06:00 → vuelve el
 *   miércoles 21:00.
 *
 * Argentina usa UTC-3 todo el año (no tiene
 * horario de verano), así que las 21:00 de
 * Argentina son las 00:00 UTC del día siguiente.
 * No depende de la zona horaria del servidor.
 */

export const HORA_REINICIO_RULETA = 21;

const OFFSET_ARGENTINA_MS = 3 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;

// Hasta esta hora, un giro cuenta como de la
// noche anterior.
export const HORA_FIN_MADRUGADA = 6;

/*
 * 21:00 (Argentina) del día siguiente al giro.
 */
export function proximoReinicioRuleta(
  ultimoGiro: Date
): Date {
  // Hora "de pared" en Argentina, expresada
  // como si fuera UTC, corrida 6 horas para
  // atrás: así la madrugada cae en el día
  // anterior.
  const enArgentina = new Date(
    ultimoGiro.getTime() -
      OFFSET_ARGENTINA_MS -
      HORA_FIN_MADRUGADA * 60 * 60 * 1000
  );

  // Las 21:00 de Argentina de ese día.
  const reinicioMismoDia =
    Date.UTC(
      enArgentina.getUTCFullYear(),
      enArgentina.getUTCMonth(),
      enArgentina.getUTCDate(),
      HORA_REINICIO_RULETA
    ) + OFFSET_ARGENTINA_MS;

  return new Date(reinicioMismoDia + DIA_MS);
}

/*
 * ¿Puede girar ahora?
 *
 * "Volvé a girar" es un premio: después de ese
 * resultado puede girar de nuevo enseguida.
 */
export function estadoRuleta(
  ultimoGiro: {
    createdAt: Date;
    premio: string;
  } | null,
  ahora = new Date()
) {
  if (!ultimoGiro || ultimoGiro.premio === "VOLVER_A_GIRAR") {
    return {
      puedeGirar: true,
      proximoReinicio: null,
      segundosRestantes: 0,
    };
  }

  const proximoReinicio = proximoReinicioRuleta(
    ultimoGiro.createdAt
  );

  const segundosRestantes = Math.max(
    0,
    Math.ceil(
      (proximoReinicio.getTime() - ahora.getTime()) /
        1000
    )
  );

  return {
    puedeGirar: segundosRestantes === 0,
    proximoReinicio,
    segundosRestantes,
  };
}

/*
 * Modo prueba: sin límite de giros.
 * Solo se activa con ROULETTE_TEST_MODE=true.
 */
export const RULETA_MODO_PRUEBA =
  process.env.ROULETTE_TEST_MODE === "true";
