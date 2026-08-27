"use client";

import {
  useEffect,
  useState,
} from "react";

type Movimiento = {
  id: string;
  tipo: "INGRESO" | "RETIRO";
  monto: number;
  descripcion: string | null;
  createdAt: string;
};

type Caja = {
  id: string;
  fecha: string;
  efectivoInicial: number;
  efectivoVentas: number;
  efectivoMixto: number;
  retiros: number;
  efectivoEsperado: number;
  efectivoContado: number | null;
  diferencia: number | null;
  estado: "ABIERTA" | "CERRADA";
  abiertaAt: string;
  cerradaAt: string | null;
  movimientos: Movimiento[];
};

type HistorialCaja = Caja;

function formatoDinero(
  monto: number
) {
  return `$${monto.toLocaleString(
    "es-AR"
  )}`;
}

function formatoFecha(
  fecha: string
) {
  return new Date(
    fecha
  ).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function CajaPage() {
  const [caja, setCaja] =
    useState<Caja | null>(null);

  const [abierta, setAbierta] =
    useState(false);

  const [
    historial,
    setHistorial,
  ] = useState<HistorialCaja[]>(
    []
  );

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    abriendo,
    setAbriendo,
  ] = useState(false);

  const [
    retirando,
    setRetirando,
  ] = useState(false);

  const [
    cerrando,
    setCerrando,
  ] = useState(false);

  const [
    efectivoInicial,
    setEfectivoInicial,
  ] = useState("");

  const [
    montoRetiro,
    setMontoRetiro,
  ] = useState("");

  const [
    descripcionRetiro,
    setDescripcionRetiro,
  ] = useState("");

  const [
    efectivoContado,
    setEfectivoContado,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  async function cargarCaja() {
    try {
      const response =
        await fetch(
          "/api/caja",
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "No se pudo obtener la caja"
        );
      }

      const data =
        await response.json();

      setAbierta(
        data.abierta
      );

      setCaja(
        data.caja
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo cargar la caja"
      );
    } finally {
      setCargando(false);
    }
  }

  async function cargarHistorial() {
    try {
      const response =
        await fetch(
          "/api/caja/historial",
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "No se pudo obtener el historial"
        );
      }

      const data =
        await response.json();

      setHistorial(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function cargarTodo() {
    await Promise.all([
      cargarCaja(),
      cargarHistorial(),
    ]);
  }

  useEffect(() => {
    cargarTodo();

    const interval =
      setInterval(
        cargarTodo,
        2000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  async function abrirCaja() {
    setError("");
    setMensaje("");

    const monto =
      Number(
        efectivoInicial
      );

    if (
      !Number.isFinite(monto) ||
      monto < 0
    ) {
      setError(
        "Ingresá un efectivo inicial válido."
      );
      return;
    }

    setAbriendo(true);

    try {
      const response =
        await fetch(
          "/api/caja/abrir",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              efectivoInicial:
                monto,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "No se pudo abrir la caja."
        );
        return;
      }

      setEfectivoInicial(
        ""
      );

      setMensaje(
        "Caja abierta correctamente."
      );

      await cargarTodo();
    } catch (error) {
      console.error(error);

      setError(
        "Error abriendo la caja."
      );
    } finally {
      setAbriendo(false);
    }
  }

  async function registrarRetiro() {
    setError("");
    setMensaje("");

    const monto =
      Number(
        montoRetiro
      );

    if (
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      setError(
        "Ingresá un monto de retiro válido."
      );
      return;
    }

    setRetirando(true);

    try {
      const response =
        await fetch(
          "/api/caja/retiro",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              monto,
              descripcion:
                descripcionRetiro ||
                "Retiro de efectivo",
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "No se pudo registrar el retiro."
        );
        return;
      }

      setMontoRetiro("");
      setDescripcionRetiro("");

      setMensaje(
        "Retiro registrado correctamente."
      );

      await cargarTodo();
    } catch (error) {
      console.error(error);

      setError(
        "Error registrando el retiro."
      );
    } finally {
      setRetirando(false);
    }
  }

  async function cerrarCaja() {
    setError("");
    setMensaje("");

    const contado =
      Number(
        efectivoContado
      );

    if (
      !Number.isFinite(
        contado
      ) ||
      contado < 0
    ) {
      setError(
        "Ingresá el efectivo contado."
      );
      return;
    }

    if (
      !window.confirm(
        "¿Seguro que querés cerrar la caja?"
      )
    ) {
      return;
    }

    setCerrando(true);

    try {
      const response =
        await fetch(
          "/api/caja/cerrar",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              efectivoContado:
                contado,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "No se pudo cerrar la caja."
        );
        return;
      }

      setEfectivoContado("");

      setMensaje(
        "Caja cerrada correctamente."
      );

      await cargarTodo();
    } catch (error) {
      console.error(error);

      setError(
        "Error cerrando la caja."
      );
    } finally {
      setCerrando(false);
    }
  }

  if (cargando) {
    return (
      <div>
        <h1
          className="
            font-display
            text-3xl
            sm:text-4xl
            lg:text-5xl
            font-extrabold
            text-tuki-cream
          "
        >
          Caja
        </h1>

        <div
          className="
            mt-10
            rounded-3xl
            bg-tuki-night-soft
            p-8
          "
        >
          <p className="text-tuki-cream/60">
            Cargando caja...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1
        className="
          font-display
          text-3xl
          sm:text-4xl
          lg:text-5xl
          font-extrabold
          text-tuki-cream
        "
      >
        Caja
      </h1>

      <p className="mt-2 text-tuki-cream/60">
        Control de efectivo,
        ventas y retiros.
      </p>

      {/* =====================================================
          MENSAJES
      ===================================================== */}

      {error && (
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/10
            p-4
            text-red-400
          "
        >
          {error}
        </div>
      )}

      {mensaje && (
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-green-500/20
            bg-green-500/10
            p-4
            text-green-400
          "
        >
          {mensaje}
        </div>
      )}

      {/* =====================================================
          CAJA CERRADA
      ===================================================== */}

      {!abierta && (
        <div
          className="
            mt-10
            max-w-2xl
            rounded-3xl
            bg-tuki-night-soft
            p-8
          "
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-red-500" />

            <h2 className="text-2xl font-bold text-tuki-cream">
              Caja cerrada
            </h2>
          </div>

          <p className="mt-3 text-tuki-cream/60">
            Para comenzar a registrar
            ventas y movimientos,
            primero tenés que abrir
            la caja.
          </p>

          <div className="mt-8">
            <label className="mb-2 block text-sm font-bold text-tuki-cream/70">
              Efectivo inicial
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                min="0"
                value={
                  efectivoInicial
                }
                onChange={(e) =>
                  setEfectivoInicial(
                    e.target.value
                  )
                }
                placeholder="Ej: 10000"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-3
                  text-tuki-cream
                  outline-none
                  focus:border-tuki-lime
                "
              />

              <button
                onClick={
                  abrirCaja
                }
                disabled={
                  abriendo
                }
                className="
                  rounded-xl
                  bg-tuki-lime
                  px-6
                  py-3
                  font-bold
                  text-black
                  transition
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {abriendo
                  ? "Abriendo..."
                  : "Abrir caja"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CAJA ABIERTA
      ===================================================== */}

      {abierta && caja && (
        <>
          <div className="mt-10">
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-green-500" />

                <h2 className="text-2xl font-bold text-tuki-cream">
                  Caja abierta
                </h2>
              </div>

              <p className="text-sm text-tuki-cream/50">
                Abierta:{" "}
                {formatoFecha(
                  caja.abiertaAt
                )}
              </p>
            </div>
          </div>

          {/* =================================================
              RESUMEN
          ================================================= */}

          <div
            className="
              mt-6
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
            "
          >
            <div className="rounded-3xl bg-tuki-night-soft p-6">
              <p className="text-sm text-tuki-cream/50">
                💵 Efectivo inicial
              </p>

              <p className="mt-2 text-3xl font-bold text-tuki-cream">
                {formatoDinero(
                  caja.efectivoInicial
                )}
              </p>
            </div>

            <div className="rounded-3xl bg-tuki-night-soft p-6">
              <p className="text-sm text-tuki-cream/50">
                💵 Ventas efectivo
              </p>

              <p className="mt-2 text-3xl font-bold text-tuki-lime">
                {formatoDinero(
                  caja.efectivoVentas
                )}
              </p>
            </div>

            <div className="rounded-3xl bg-tuki-night-soft p-6">
              <p className="text-sm text-tuki-cream/50">
                🔀 Ventas mixtas
              </p>

              <p className="mt-2 text-3xl font-bold text-tuki-lime">
                {formatoDinero(
                  caja.efectivoMixto
                )}
              </p>

              <p className="mt-1 text-xs text-tuki-cream/40">
                Solo parte en
                efectivo
              </p>
            </div>

            <div className="rounded-3xl bg-tuki-night-soft p-6">
              <p className="text-sm text-tuki-cream/50">
                💸 Retiros
              </p>

              <p className="mt-2 text-3xl font-bold text-red-400">
                -{" "}
                {formatoDinero(
                  caja.retiros
                )}
              </p>
            </div>
          </div>

          {/* =================================================
              EFECTIVO ESPERADO
          ================================================= */}

          <div
            className="
              mt-6
              rounded-3xl
              bg-tuki-lime/10
              p-8
            "
          >
            <p className="text-sm font-bold text-tuki-lime/70">
              💰 Efectivo que debería
              haber en caja
            </p>

            <p className="mt-2 text-4xl sm:text-5xl font-extrabold text-tuki-lime">
              {formatoDinero(
                caja.efectivoEsperado
              )}
            </p>

            <p className="mt-2 text-sm text-tuki-cream/50">
              Efectivo inicial + ventas
              en efectivo + efectivo de
              pagos mixtos − retiros
            </p>
          </div>

          {/* =================================================
              RETIRO
          ================================================= */}

          <div
            className="
              mt-8
              rounded-3xl
              bg-tuki-night-soft
              p-8
            "
          >
            <h2 className="text-2xl font-bold text-tuki-cream">
              Registrar retiro
            </h2>

            <p className="mt-1 text-sm text-tuki-cream/50">
              Sacar dinero físicamente
              de la caja.
            </p>

            <div
              className="
                mt-6
                grid
                grid-cols-1
                lg:grid-cols-3
                gap-4
              "
            >
              <div>
                <label className="mb-2 block text-sm text-tuki-cream/60">
                  Monto
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    montoRetiro
                  }
                  onChange={(e) =>
                    setMontoRetiro(
                      e.target.value
                    )
                  }
                  placeholder="Ej: 5000"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-3
                    text-tuki-cream
                    outline-none
                    focus:border-tuki-lime
                  "
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-tuki-cream/60">
                  Motivo
                </label>

                <input
                  type="text"
                  value={
                    descripcionRetiro
                  }
                  onChange={(e) =>
                    setDescripcionRetiro(
                      e.target.value
                    )
                  }
                  placeholder="Ej: Retiro del día"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-3
                    text-tuki-cream
                    outline-none
                    focus:border-tuki-lime
                  "
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={
                    registrarRetiro
                  }
                  disabled={
                    retirando
                  }
                  className="
                    w-full
                    rounded-xl
                    bg-red-500
                    px-5
                    py-3
                    font-bold
                    text-white
                    transition
                    hover:opacity-90
                    disabled:opacity-50
                  "
                >
                  {retirando
                    ? "Registrando..."
                    : "Registrar retiro"}
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              MOVIMIENTOS
          ================================================= */}

          <div
            className="
              mt-8
              rounded-3xl
              bg-tuki-night-soft
              p-8
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-tuki-cream">
                  Movimientos
                </h2>

                <p className="mt-1 text-sm text-tuki-cream/50">
                  Ingresos y retiros de
                  efectivo.
                </p>
              </div>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-tuki-cream/50">
                {caja.movimientos.length}{" "}
                movimientos
              </span>
            </div>

            {caja.movimientos
              .length === 0 ? (
              <div className="mt-6 rounded-2xl bg-white/5 p-6 text-center">
                <p className="text-tuki-cream/50">
                  Todavía no hay
                  movimientos.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {caja.movimientos.map(
                  (movimiento) => (
                    <div
                      key={
                        movimiento.id
                      }
                      className="
                        flex
                        flex-col
                        gap-3
                        rounded-2xl
                        bg-white/5
                        p-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            ${
                              movimiento.tipo ===
                              "INGRESO"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }
                          `}
                        >
                          {movimiento.tipo ===
                          "INGRESO"
                            ? "↑"
                            : "↓"}
                        </div>

                        <div>
                          <p className="font-bold text-tuki-cream">
                            {movimiento.descripcion ||
                              (movimiento.tipo ===
                              "INGRESO"
                                ? "Ingreso"
                                : "Retiro")}
                          </p>

                          <p className="text-xs text-tuki-cream/40">
                            {formatoFecha(
                              movimiento.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`
                          text-xl
                          font-bold
                          ${
                            movimiento.tipo ===
                            "INGRESO"
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        `}
                      >
                        {movimiento.tipo ===
                        "INGRESO"
                          ? "+"
                          : "-"}
                        {formatoDinero(
                          movimiento.monto
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* =================================================
              CERRAR CAJA
          ================================================= */}

          <div
            className="
              mt-8
              rounded-3xl
              bg-tuki-night-soft
              p-8
            "
          >
            <h2 className="text-2xl font-bold text-tuki-cream">
              Cerrar caja
            </h2>

            <p className="mt-1 text-sm text-tuki-cream/50">
              Contá físicamente el dinero
              que tenés y comparalo con
              lo esperado.
            </p>

            <div
              className="
                mt-6
                grid
                grid-cols-1
                lg:grid-cols-3
                gap-5
              "
            >
              <div className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm text-tuki-cream/50">
                  Esperado
                </p>

                <p className="mt-2 text-3xl font-bold text-tuki-lime">
                  {formatoDinero(
                    caja.efectivoEsperado
                  )}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-tuki-cream/70">
                  Efectivo contado
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    efectivoContado
                  }
                  onChange={(e) =>
                    setEfectivoContado(
                      e.target.value
                    )
                  }
                  placeholder="Ej: 38000"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-4
                    text-xl
                    font-bold
                    text-tuki-cream
                    outline-none
                    focus:border-tuki-lime
                  "
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={
                    cerrarCaja
                  }
                  disabled={
                    cerrando
                  }
                  className="
                    w-full
                    rounded-xl
                    bg-tuki-lime
                    px-5
                    py-4
                    font-bold
                    text-black
                    transition
                    hover:opacity-90
                    disabled:opacity-50
                  "
                >
                  {cerrando
                    ? "Cerrando..."
                    : "Cerrar caja"}
                </button>
              </div>
            </div>

            {efectivoContado !==
              "" && (
              <div className="mt-6 rounded-2xl bg-white/5 p-5">
                <p className="text-sm text-tuki-cream/50">
                  Diferencia estimada
                </p>

                <p
                  className={`
                    mt-2
                    text-3xl
                    font-bold
                    ${
                      Number(
                        efectivoContado
                      ) -
                        caja.efectivoEsperado ===
                      0
                        ? "text-green-400"
                        : Number(
                              efectivoContado
                            ) >
                            caja.efectivoEsperado
                        ? "text-blue-400"
                        : "text-red-400"
                    }
                  `}
                >
                  {formatoDinero(
                    Number(
                      efectivoContado
                    ) -
                      caja.efectivoEsperado
                  )}
                </p>

                <p className="mt-1 text-xs text-tuki-cream/40">
                  Positivo = sobra dinero.
                  Negativo = falta dinero.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* =====================================================
          HISTORIAL
      ===================================================== */}

      <div
        className="
          mt-10
          rounded-3xl
          bg-tuki-night-soft
          p-8
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h2 className="text-2xl font-bold text-tuki-cream">
              Historial de cajas
            </h2>

            <p className="mt-1 text-sm text-tuki-cream/50">
              Cajas cerradas anteriormente.
            </p>
          </div>

          <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-tuki-cream/50">
            {historial.length} cajas
          </span>
        </div>

        {historial.length ===
        0 ? (
          <div className="mt-6 rounded-2xl bg-white/5 p-6 text-center">
            <p className="text-tuki-cream/50">
              Todavía no hay cajas
              cerradas.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 text-sm font-bold text-tuki-cream/50">
                    Apertura
                  </th>

                  <th className="pb-3 text-right text-sm font-bold text-tuki-cream/50">
                    Inicial
                  </th>

                  <th className="pb-3 text-right text-sm font-bold text-tuki-cream/50">
                    Ventas efectivo
                  </th>

                  <th className="pb-3 text-right text-sm font-bold text-tuki-cream/50">
                    Mixto
                  </th>

                  <th className="pb-3 text-right text-sm font-bold text-tuki-cream/50">
                    Retiros
                  </th>

                  <th className="pb-3 text-right text-sm font-bold text-tuki-cream/50">
                    Esperado
                  </th>

                  <th className="pb-3 text-right text-sm font-bold text-tuki-cream/50">
                    Contado
                  </th>

                  <th className="pb-3 text-right text-sm font-bold text-tuki-cream/50">
                    Diferencia
                  </th>
                </tr>
              </thead>

              <tbody>
                {historial.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-4 text-tuki-cream">
                        {formatoFecha(
                          item.abiertaAt
                        )}
                      </td>

                      <td className="py-4 text-right text-tuki-cream/70">
                        {formatoDinero(
                          item.efectivoInicial
                        )}
                      </td>

                      <td className="py-4 text-right text-tuki-cream/70">
                        {formatoDinero(
                          item.efectivoVentas
                        )}
                      </td>

                      <td className="py-4 text-right text-tuki-cream/70">
                        {formatoDinero(
                          item.efectivoMixto
                        )}
                      </td>

                      <td className="py-4 text-right text-red-400">
                        -{" "}
                        {formatoDinero(
                          item.retiros
                        )}
                      </td>

                      <td className="py-4 text-right font-bold text-tuki-lime">
                        {formatoDinero(
                          item.efectivoEsperado ??
                            0
                        )}
                      </td>

                      <td className="py-4 text-right text-tuki-cream/70">
                        {formatoDinero(
                          item.efectivoContado ??
                            0
                        )}
                      </td>

                      <td
                        className={`
                          py-4
                          text-right
                          font-bold
                          ${
                            (item.diferencia ??
                              0) ===
                            0
                              ? "text-green-400"
                              : (item.diferencia ??
                                  0) >
                                0
                              ? "text-blue-400"
                              : "text-red-400"
                          }
                        `}
                      >
                        {formatoDinero(
                          item.diferencia ??
                            0
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}