"use client";

import {
  useEffect,
  useState,
} from "react";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { RouletteWheel } from "@/components/roulette/roulette-wheel";

import { RouletteResultModal } from "@/components/roulette/roulette-result-modal";

import {
  getRoulettePrizeStyle,
  type RoulettePrize,
} from "@/lib/data/rewards";

import { useUser } from "@/hooks/useUser";

import { RegisterModal } from "@/components/auth/register-modal";

const SPIN_DURATION_MS = 4200;

export function RouletteSection() {
  const { phone } = useUser();

  const [prizes, setPrizes] =
    useState<RoulettePrize[]>([]);

  const [prizesLoading, setPrizesLoading] =
    useState(true);

  const [rotation, setRotation] =
    useState(0);

  const [isSpinning, setIsSpinning] =
    useState(false);

  const [
    showRegisterModal,
    setShowRegisterModal,
  ] = useState(false);

  const [result, setResult] =
    useState<RoulettePrize | null>(null);

  const [canSpin, setCanSpin] =
    useState(true);

  /*
   * Próximo reinicio (21:00 Argentina) y
   * segundos que faltan, según el servidor.
   */
  const [nextReset, setNextReset] =
    useState<{
      fecha: Date;
      segundos: number;
    } | null>(null);

  const [loading, setLoading] =
    useState(false);

  /*
   * Cargar premios activos desde PostgreSQL
   */
  async function loadPrizes() {
    try {
      setPrizesLoading(true);

      const response = await fetch(
        "/api/roulette/prizes",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudieron cargar los premios"
        );
      }

      const data =
        await response.json();

      setPrizes(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando premios:",
        error
      );

      setPrizes([]);
    } finally {
      setPrizesLoading(false);
    }
  }

  /*
   * Verificar si el usuario puede girar
   */
  async function checkRoulette() {
    if (!phone) {
      setCanSpin(true);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/roulette?phone=${encodeURIComponent(
            phone
          )}`,
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "No se pudo consultar la ruleta"
        );
      }

      const data =
        await response.json();

      /*
       * Sin sesión (por ejemplo, se registró
       * antes de esta versión): mostramos el
       * botón y al tocarlo le pedimos ingresar.
       */
      setCanSpin(
        data.canSpin === true ||
          data.needsLogin === true
      );

      setNextReset(
        data.nextReset
          ? {
              fecha: new Date(
                data.nextReset
              ),
              segundos:
                data.secondsLeft ?? 0,
            }
          : null
      );
    } catch (error) {
      console.error(
        "Error verificando ruleta:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Cargar premios al montar
   */
  useEffect(() => {
    loadPrizes();
  }, []);

  /*
   * Verificar cooldown
   */
  useEffect(() => {
    if (!phone) {
      setCanSpin(true);
      setLoading(false);
      return;
    }

    checkRoulette();

    const interval =
      setInterval(() => {
        checkRoulette();
      }, 30000);

    return () =>
      clearInterval(interval);
  }, [phone]);

  /*
   * Girar ruleta
   */
  async function handleSpin() {
    if (!phone) {
      setShowRegisterModal(true);
      return;
    }

    if (isSpinning) {
      return;
    }

    if (prizes.length === 0) {
      alert(
        "No hay premios disponibles en este momento."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/roulette/spin",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              phone,
            }),
          }
        );

      const data =
        await response.json();

      if (data?.needsLogin) {
        setShowRegisterModal(true);
        return;
      }

      if (!response.ok) {
        alert(
          data?.error ??
            "Ya giraste la ruleta hoy. Volvé mañana."
        );

        return;
      }

      const prize =
        data?.premio;

      if (!prize) {
        alert(
          "No se pudo obtener el premio."
        );

        return;
      }

      /*
       * Buscar el premio recibido
       * dentro de los premios que actualmente
       * están activos en PostgreSQL.
       */
      const prizeIndex =
        prizes.findIndex(
          (p) =>
            p.tipo === prize.tipo
        );

      if (prizeIndex === -1) {
        console.error(
          "El premio recibido por el backend no está en la ruleta pública:",
          prize
        );

        /*
         * Recargamos por si el Admin
         * modificó los premios mientras
         * el usuario tenía la página abierta.
         */
        await loadPrizes();

        alert(
          "Los premios fueron actualizados. Volvé a intentar."
        );

        return;
      }

      const segmentAngle =
        360 / prizes.length;

      const targetSegmentCenter =
        prizeIndex *
          segmentAngle +
        segmentAngle / 2;

      const extraSpins =
        6 * 360;

      const finalRotation =
        rotation +
        extraSpins +
        (360 -
          targetSegmentCenter) -
        (rotation % 360);

      setCanSpin(false);

      setIsSpinning(true);

      setRotation(
        finalRotation
      );

      window.setTimeout(() => {
        setIsSpinning(false);

        setResult(prize);

        checkRoulette();
      }, SPIN_DURATION_MS);
    } catch (error) {
      console.error(
        "Error girando ruleta:",
        error
      );

      alert(
        "Ocurrió un error al girar la ruleta."
      );
    } finally {
      setLoading(false);
    }
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
          Girá una vez por día y
          descubrí qué tiene
          preparada la noche para
          vos.
        </p>

        <div className="mt-10">
          {prizesLoading ? (
            <div className="flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
              <p className="text-sm text-tuki-cream/60">
                Cargando ruleta...
              </p>
            </div>
          ) : (
            <RouletteWheel
              rotation={rotation}
              isSpinning={isSpinning}
              prizes={prizes}
            />
          )}
        </div>

        <div className="mt-10 w-full max-w-xs">
          {loading ||
          prizesLoading ? (
            <p className="text-sm text-tuki-cream/60">
              Cargando...
            </p>
          ) : canSpin ? (
            <Button
              size="lg"
              variant="lime"
              onClick={handleSpin}
              disabled={
                isSpinning ||
                prizes.length === 0
              }
              className="w-full"
            >
              {isSpinning
                ? "Girando..."
                : "🎰 Girar"}
            </Button>
          ) : (
            <div className="rounded-2xl bg-white/5 px-4 py-3">
              <p className="font-display text-lg font-extrabold text-tuki-yellow">
                🎰 Próxima ruleta
              </p>

              <p className="mt-1 text-sm text-tuki-cream">
                {nextReset
                  ? textoProximoGiro(
                      nextReset.fecha,
                      nextReset.segundos
                    )
                  : "Disponible todos los días a las 21:00"}
              </p>

              {nextReset && (
                <p className="mt-1 text-xs text-tuki-cream/50">
                  Se reinicia todos los días a las 21:00
                </p>
              )}
            </div>
          )}
        </div>

        {/* Lista de premios */}
        {!prizesLoading &&
          prizes.length > 0 && (
            <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-3">
              {prizes.map(
                (prize) => {
                  const style =
                    getRoulettePrizeStyle(
                      prize.tipo
                    );

                  return (
                    <div
                      key={prize.id}
                      className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-left"
                    >
                      <span className="text-base">
                        {style.emoji}
                      </span>

                      <span className="text-xs font-semibold text-tuki-cream/80">
                        {prize.nombre}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}
      </div>

      {result && (
        <RouletteResultModal
          prize={result}
          onClose={() =>
            setResult(null)
          }
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
/*
 * "hoy a las 21:00 (en 2 h 15 min)",
 * "mañana a las 21:00 (en 23 h 40 min)" o
 * "pasado mañana a las 21:00" (si giró
 * pasada la medianoche).
 *
 * "Hoy" y "mañana" se calculan en hora de
 * Argentina, no del celular del cliente.
 */
function textoProximoGiro(
  fecha: Date,
  segundos: number
) {
  const diaArgentina = (d: Date) =>
    d.toLocaleDateString("es-AR", {
      timeZone:
        "America/Argentina/Buenos_Aires",
    });

  const ahora = new Date();
  const manana = new Date(
    ahora.getTime() + 24 * 60 * 60 * 1000
  );

  const cuando =
    diaArgentina(fecha) === diaArgentina(ahora)
      ? "hoy"
      : diaArgentina(fecha) === diaArgentina(manana)
        ? "mañana"
        : "pasado mañana";

  const totalMinutos = Math.max(
    1,
    Math.ceil(segundos / 60)
  );
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  const falta =
    horas > 0
      ? `${horas} h ${minutos} min`
      : `${minutos} min`;

  return `Vuelve ${cuando} a las 21:00 (en ${falta})`;
}
