"use client";

import {
  useState,
  useEffect,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Landmark,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import {
  calcularBeneficios,
  esCajaMisteriosa,
  type CuponValido,
  type PremioRuleta,
} from "@/lib/promociones";
import type {
  CheckoutOrder,
  PaymentMethod,
} from "@/types/cart";

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  helper: string;
  icon: typeof Banknote;
}[] = [
  {
    value: "efectivo",
    label: "Efectivo",
    helper:
      "Pagás al recibir tu pedido",
    icon: Banknote,
  },
  {
    value: "transferencia",
    label: "Transferencia",
    helper:
      "Te pasamos el alias al confirmar",
    icon: Landmark,
  },
  {
    value: "mixto",
    label:
      "Efectivo + Transferencia",
    helper:
      "Pagás una parte de cada forma",
    icon: Banknote,
  },
];

type CoordenadasEntrega = {
  lat: number;
  lng: number;
};

type ZonaEnvio = {
  id: string;
  nombre: string;
  precio: number;
  compraMinima: number;
};

export default function CheckoutPage() {
  /*
   * ==========================================
   * PREMIOS
   * ==========================================
   */

  const [reward, setReward] =
    useState<PremioRuleta | null>(
      null
    );

  /*
   * ==========================================
   * BONO DE BIENVENIDA Y CUPÓN
   * ==========================================
   */

  const [
    primeraCompra,
    setPrimeraCompra,
  ] = useState(false);

  const [cuponInput, setCuponInput] =
    useState("");

  const [
    cuponCodigo,
    setCuponCodigo,
  ] = useState("");

  const [cupon, setCupon] =
    useState<CuponValido | null>(
      null
    );

  const [cuponError, setCuponError] =
    useState("");

  /*
   * ==========================================
   * HAPPY HOUR
   * ==========================================
   */

  const [happyHour, setHappyHour] =
    useState<any>(null);

  const [
    loadingHappyHour,
    setLoadingHappyHour,
  ] = useState(true);

  /*
   * ==========================================
   * CONFIGURACIÓN
   * ==========================================
   */

  const [abierto, setAbierto] =
    useState(true);

  const router = useRouter();

  /*
   * ==========================================
   * CARRITO
   * ==========================================
   */

  const {
    items,
    subtotal,
    clearCart,
  } = useCart();

  /*
   * ==========================================
   * DATOS DEL CLIENTE
   * ==========================================
   */

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [phone, setPhone] =
    useState("");

  /*
   * ==========================================
   * DIRECCIÓN
   * ==========================================
   *
   * Ahora usamos calle + número separados.
   */

  const [calle, setCalle] =
    useState("");

  const [numero, setNumero] =
    useState("");

  /*
   * Dirección completa que se enviará
   * al pedido.
   */
  const [address, setAddress] =
    useState("");

  /*
   * ==========================================
   * ZONA DE ENVÍO
   * ==========================================
   */

  const [zonaEnvio, setZonaEnvio] =
    useState<ZonaEnvio | null>(
      null
    );

  /*
   * ==========================================
   * COORDENADAS
   * ==========================================
   */

  const [
    coordenadasEntrega,
    setCoordenadasEntrega,
  ] =
    useState<CoordenadasEntrega | null>(
      null
    );

  /*
   * Dirección devuelta por el servicio
   * de geocodificación.
   */

  const [
    direccionEncontrada,
    setDireccionEncontrada,
  ] = useState("");

  /*
   * ==========================================
   * VERIFICACIÓN DE DIRECCIÓN
   * ==========================================
   */

  const [
    direccionVerificada,
    setDireccionVerificada,
  ] = useState(false);

  const [
    verificandoDireccion,
    setVerificandoDireccion,
  ] = useState(false);

  const [
    errorDireccion,
    setErrorDireccion,
  ] = useState("");

  /*
   * ==========================================
   * OTROS DATOS
   * ==========================================
   */

  const [notes, setNotes] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "efectivo"
    );

  const [
    montoEfectivo,
    setMontoEfectivo,
  ] = useState("");

  const [
    montoTransferencia,
    setMontoTransferencia,
  ] = useState("");

  /*
   * Este estado queda conservado para
   * mantener compatibilidad con el checkout
   * anterior.
   */
  const [
    submittedOrder,
    setSubmittedOrder,
  ] =
    useState<CheckoutOrder | null>(
      null
    );

  const isEmpty =
    items.length === 0;

  /*
   * ==========================================
   * ENVÍO
   * ==========================================
   */

  /*
   * El envío depende de la zona. Hasta que el
   * cliente verifica la dirección no lo sabemos,
   * así que no se suma al total.
   */
  const envioZona =
    zonaEnvio?.precio ?? 0;

  /*
   * ==========================================
   * BENEFICIO (UNO SOLO POR PEDIDO)
   * ==========================================
   *
   * Mismo cálculo que hace /api/pedidos
   * (lib/promociones.ts).
   */

  const beneficios =
    calcularBeneficios({
      subtotal,
      envio: envioZona,
      subtotalCajas: items
        .filter((item) =>
          esCajaMisteriosa(item)
        )
        .reduce(
          (total, item) =>
            total +
            item.price *
              item.quantity,
          0
        ),
      primeraCompra,
      premio: reward,
      happyHour,
      cupon,
    });

  const beneficio =
    beneficios.elegido;

  const delivery =
    beneficios.envio;

  const discount =
    beneficios.descuento;

  /*
   * Beneficios disponibles que todavía
   * no llegan a su compra mínima.
   */
  const beneficiosPendientes =
    beneficios.candidatos.filter(
      (c) => !c.aplica
    );

  /*
   * ==========================================
   * TOTAL
   * ==========================================
   */

  const total =
    Math.max(
      0,
      subtotal -
        discount +
        delivery
    );

  /*
   * ==========================================
   * PAGO MIXTO
   * ==========================================
   */

  const efectivo =
    Number(montoEfectivo) || 0;

  const transferencia =
    Number(
      montoTransferencia
    ) || 0;

  const totalMixto =
    efectivo +
    transferencia;

  const pagoMixtoValido =
    paymentMethod !== "mixto" ||
    totalMixto === total;

  /*
   * ==========================================
   * COMPRA MÍNIMA
   * ==========================================
   */

  const compraMinimaValida =
    !!zonaEnvio &&
    subtotal >=
      zonaEnvio.compraMinima;

  /*
   * ==========================================
   * CARGAR USUARIO
   * ==========================================
   */

  useEffect(() => {
    const storedPhone =
      localStorage.getItem(
        "tuki_user_phone"
      );

    const storedName =
      localStorage.getItem(
        "tuki_user_name"
      );

    if (storedPhone) {
      setPhone(storedPhone);
    }

    if (storedName) {
      setCustomerName(
        storedName
      );
    }
  }, []);

  /*
   * ==========================================
   * CARGAR PREMIO
   * ==========================================
   */

  useEffect(() => {
    async function loadBeneficios() {
      if (!phone) return;

      try {
        const params =
          new URLSearchParams({
            phone,
          });

        if (cuponCodigo) {
          params.set(
            "cupon",
            cuponCodigo
          );
        }

        /*
         * Con la dirección verificada se
         * controla también la ubicación
         * (bono y cupones por dirección).
         */
        if (coordenadasEntrega) {
          params.set(
            "lat",
            String(
              coordenadasEntrega.lat
            )
          );
          params.set(
            "lng",
            String(
              coordenadasEntrega.lng
            )
          );
          params.set(
            "direccion",
            `${calle.trim()} ${numero.trim()}`.trim()
          );
        }

        const response =
          await fetch(
            `/api/beneficios?${params.toString()}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setReward(data.premio);
        setPrimeraCompra(
          data.primeraCompra
        );
        setCupon(data.cupon);
        setCuponError(
          data.cuponError ?? ""
        );
      } catch (error) {
        console.error(
          "Error cargando beneficios:",
          error
        );
      }
    }

    loadBeneficios();
    // calle y número se leen solo cuando cambian
    // las coordenadas (dirección verificada).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, cuponCodigo, coordenadasEntrega]);

  /*
   * ==========================================
   * CARGAR CONFIGURACIÓN
   * ==========================================
   */

  useEffect(() => {
    async function loadConfig() {
      try {
        const response =
          await fetch(
            "/api/configuracion",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setAbierto(
          data.abierto
        );

      } catch (error) {
        console.error(
          "Error cargando configuración:",
          error
        );
      }
    }

    loadConfig();

    const interval =
      setInterval(
        loadConfig,
        10000
      );

    return () =>
      clearInterval(interval);
  }, []);

  /*
   * ==========================================
   * CARGAR HAPPY HOUR
   * ==========================================
   */

  useEffect(() => {
    async function loadHappyHour() {
      try {
        const response =
          await fetch(
            "/api/happy-hour",
            {
              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        console.log(
          "HAPPY HOUR:",
          data
        );

        setHappyHour(data);
      } catch (error) {
        console.error(
          "Error cargando Happy Hour:",
          error
        );
      } finally {
        setLoadingHappyHour(
          false
        );
      }
    }

    loadHappyHour();

    const interval =
      setInterval(
        loadHappyHour,
        2000
      );

    return () =>
      clearInterval(interval);
  }, []);

  /*
   * ==========================================
   * LIMPIAR UBICACIÓN
   * ==========================================
   *
   * Si el cliente modifica calle o número,
   * invalidamos la verificación anterior.
   */

  function limpiarVerificacionDireccion() {
    setDireccionVerificada(
      false
    );

    setZonaEnvio(null);

    setCoordenadasEntrega(
      null
    );

    setDireccionEncontrada("");

    setAddress("");

    setErrorDireccion("");
  }

  /*
   * ==========================================
   * VERIFICAR DIRECCIÓN
   * ==========================================
   *
   * Envía:
   *
   * calle
   * numero
   *
   * al backend.
   *
   * El backend:
   *
   * 1. Busca la dirección.
   * 2. Obtiene lat/lng.
   * 3. Comprueba la zona.
   * 4. Devuelve precio y mínimo.
   */

  async function verificarDireccion() {
    const calleLimpia =
      calle.trim();

    const numeroLimpio =
      numero.trim();

    if (!calleLimpia) {
      setErrorDireccion(
        "Ingresá la calle."
      );

      return;
    }

    if (!numeroLimpio) {
      setErrorDireccion(
        "Ingresá el número."
      );

      return;
    }

    setVerificandoDireccion(
      true
    );

    setErrorDireccion("");

    setDireccionVerificada(
      false
    );

    setZonaEnvio(null);

    setCoordenadasEntrega(
      null
    );

    setDireccionEncontrada("");

    try {
      const params =
        new URLSearchParams({
          calle: calleLimpia,
          numero: numeroLimpio,
        });

      const response =
        await fetch(
          `/api/zonas-envio/verificar-direccion?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      /*
       * ========================================
       * ERROR DEL SERVIDOR
       * ========================================
       */

      if (!response.ok) {
        setErrorDireccion(
          data.error ??
            "No pudimos verificar la dirección."
        );

        return;
      }

      /*
       * ========================================
       * NO ENCONTRADA
       * ========================================
       */

      if (
        !data.direccionEncontrada ||
        !data.coordenadas
      ) {
        setErrorDireccion(
          data.error ??
            "No pudimos ubicar esa dirección en Miramar."
        );

        return;
      }

      /*
       * ========================================
       * GUARDAR COORDENADAS
       * ========================================
       */

      setCoordenadasEntrega(
        data.coordenadas
      );

      /*
       * ========================================
       * GUARDAR DIRECCIÓN ENCONTRADA
       * ========================================
       */

      const direccion =
        data.direccion ??
        `${calleLimpia} ${numeroLimpio}`;

      setDireccionEncontrada(
        direccion
      );

      /*
       * Esta es la dirección que enviamos
       * al pedido.
       */
      setAddress(
        `${calleLimpia} ${numeroLimpio}`
      );

      /*
       * ========================================
       * DIRECCIÓN FUERA DE ZONA
       * ========================================
       */

      if (
        !data.disponible ||
        !data.zona
      ) {
        setZonaEnvio(null);

        setDireccionVerificada(
          false
        );

        setErrorDireccion(
          data.error ??
            "Esta dirección está fuera de nuestras zonas de reparto."
        );

        return;
      }

      /*
       * ========================================
       * ZONA ENCONTRADA
       * ========================================
       */

      setZonaEnvio(
        data.zona
      );

      /*
       * La dirección queda completamente
       * verificada.
       */
      setDireccionVerificada(
        true
      );

      setErrorDireccion("");

      /*
       * ========================================
       * SCROLL AL RESUMEN
       * ========================================
       */

      setTimeout(() => {
        document
          .getElementById(
            "resumen-pedido"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      console.error(
        "Error verificando dirección:",
        error
      );

      setDireccionVerificada(
        false
      );

      setZonaEnvio(null);

      setCoordenadasEntrega(
        null
      );

      setDireccionEncontrada("");

      setErrorDireccion(
        "No se pudo verificar la dirección. Intentá nuevamente."
      );
    } finally {
      setVerificandoDireccion(
        false
      );
    }
  }

  /*
   * ==========================================
   * CREAR PEDIDO
   * ==========================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isEmpty) {
      return;
    }

    /*
     * La dirección debe estar verificada.
     */

    if (
      !direccionVerificada ||
      !zonaEnvio ||
      !coordenadasEntrega
    ) {
      alert(
        "Primero verificá tu dirección."
      );

      return;
    }

    /*
     * Compra mínima.
     */

    if (
      subtotal <
      zonaEnvio.compraMinima
    ) {
      alert(
        `El pedido mínimo para ${
          zonaEnvio.nombre
        } es de ${formatPrice(
          zonaEnvio.compraMinima
        )}.`
      );

      return;
    }

    /*
     * Pago mixto.
     */

    if (
      paymentMethod ===
        "mixto" &&
      !pagoMixtoValido
    ) {
      alert(
        `Los importes deben sumar exactamente ${formatPrice(
          total
        )}.`
      );

      return;
    }

    /*
     * ========================================
     * DIRECCIÓN COMPLETA
     * ========================================
     */

    const direccionCompleta =
      `${calle.trim()} ${numero.trim()}`.trim();

    /*
     * ========================================
     * OBJETO LOCAL
     * ========================================
     *
     * Lo conservamos porque forma parte
     * del flujo anterior.
     */

    const order: CheckoutOrder = {
      customerName,
      phone,
      address:
        direccionCompleta,
      notes,
      paymentMethod,
      montoEfectivo:
        paymentMethod ===
        "mixto"
          ? efectivo
          : undefined,
      montoTransferencia:
        paymentMethod ===
        "mixto"
          ? transferencia
          : undefined,
      items,
      subtotal,
      total,
      reward:
        beneficio?.titulo,
    };

    /*
     * Evitamos warning de variable
     * no utilizada mientras mantenemos
     * el objeto para compatibilidad.
     */
    console.log(
      "ORDEN CHECKOUT:",
      order
    );

    /*
     * ========================================
     * ENVIAR AL BACKEND
     * ========================================
     */

    try {
      const response =
        await fetch(
          "/api/pedidos",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              nombre:
                customerName,

              telefono:
                phone,

              direccion:
                direccionCompleta,

              zonaId:
                zonaEnvio.id,

              coordenadasEntrega:
                coordenadasEntrega,

              direccionEncontrada:
                direccionEncontrada,

              metodoPago:
                paymentMethod,

              montoEfectivo:
                paymentMethod ===
                "mixto"
                  ? efectivo
                  : null,

              montoTransferencia:
                paymentMethod ===
                "mixto"
                  ? transferencia
                  : null,

              observaciones:
                notes,

              cupon:
                cupon
                  ? cupon.codigo
                  : undefined,

              items: items.map(
                (item) => ({
                  nombre:
                    item.name,

                  cantidad:
                    item.quantity,
                })
              ),
            }),
          }
        );

      const pedido =
        await response.json();

      console.log(
        "PEDIDO RECIBIDO:",
        pedido
      );

      if (
        !response.ok ||
        !pedido.numero
      ) {
        alert(
          pedido.error ??
            "No se pudo generar el pedido."
        );

        return;
      }

      /*
       * El servidor ya marcó como usado el
       * beneficio que se aplicó.
       */

      /*
       * ======================================
       * GUARDAR PEDIDO
       * ======================================
       */

      localStorage.setItem(
        "tuki_last_order",
        pedido.numero.toString()
      );

      clearCart();

      router.push(
        `/pedido-exitoso/${pedido.numero}`
      );
    } catch (error) {
      console.error(
        "Error creando pedido:",
        error
      );

      alert(
        "Ocurrió un error al crear el pedido. Intentá nuevamente."
      );
    }
  }

  /*
   * ==========================================
   * PEDIDO ENVIADO
   * ==========================================
   */

  if (submittedOrder) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tuki-lime/15">
          <CheckCircle2
            className="h-8 w-8 text-tuki-lime"
            strokeWidth={2.5}
          />
        </span>

        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            ¡Pedido recibido!
          </h1>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Gracias{" "}
            {submittedOrder.customerName ||
              "por tu pedido"}
            , la noche ya está preparando algo rico para vos. 🍬
            Te contactamos al{" "}
            {submittedOrder.phone}{" "}
            para coordinar la entrega.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-3xl bg-card p-5 text-left shadow-soft">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-tuki-lime">
            Resumen
          </p>

          <ul className="mt-3 flex flex-col gap-1.5">
            {submittedOrder.items.map(
              (item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm text-card-foreground"
                >
                  <span className="truncate pr-2">
                    {item.name} x
                    {item.quantity}
                  </span>

                  <span className="shrink-0 font-semibold">
                    {formatPrice(
                      item.price *
                        item.quantity
                    )}
                  </span>
                </li>
              )
            )}
          </ul>

          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-card-foreground">
                Subtotal
              </span>

              <span className="font-semibold">
                {formatPrice(
                  submittedOrder.subtotal
                )}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-green-500">
                  Descuento
                </span>

                <span className="text-green-500">
                  -
                  {formatPrice(
                    discount
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-card-foreground">
                Envío
              </span>

              <span className="font-semibold">
                {formatPrice(
                  delivery
                )}
              </span>
            </div>

            {beneficio?.regalo && (
              <div className="rounded-xl bg-green-500/10 p-3 text-sm text-green-400">
                {beneficio.regalo}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-display text-sm font-bold text-card-foreground">
                Total
              </span>

              <span className="font-display text-lg font-extrabold text-tuki-lime">
                {formatPrice(
                  submittedOrder.total
                )}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="lime"
          size="lg"
          asChild
        >
          <Link href="/">
            Volver al inicio
          </Link>
        </Button>
      </main>
    );
  }

  /*
   * ==========================================
   * CHECKOUT
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl">
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="mb-6 flex items-center gap-1.5 font-display text-sm font-semibold text-tuki-cream/70 transition-colors hover:text-tuki-lime"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Finalizar pedido
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Completá tus datos para coordinar la entrega.
        </p>

        {isEmpty ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-card p-8 text-center shadow-soft">
            <p className="font-display text-base font-bold text-card-foreground">
              Tu carrito está vacío
            </p>

            <p className="text-sm text-muted-foreground">
              Agregá algún antojo antes de finalizar el pedido.
            </p>

            <Button
              variant="lime"
              asChild
            >
              <Link href="/">
                Ver antojos
              </Link>
            </Button>
          </div>
        ) : (
          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 flex flex-col gap-8"
          >
            {/* =====================================
                DATOS DE ENTREGA
            ====================================== */}

            <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-soft">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tuki-lime">
                Datos de entrega
              </h2>

              {/* NOMBRE */}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="customerName"
                  className="font-display text-xs font-semibold text-card-foreground/80"
                >
                  Nombre y apellido
                </label>

                <Input
                  id="customerName"
                  required
                  value={
                    customerName
                  }
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value
                    )
                  }
                  placeholder="¿Cómo te llamás?"
                />
              </div>

              {/* TELÉFONO */}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="font-display text-xs font-semibold text-card-foreground/80"
                >
                  Teléfono
                </label>

                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="11 2345 6789"
                />
              </div>

              {/* =================================
                  DIRECCIÓN
              ================================== */}

              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="font-display text-sm font-bold text-card-foreground">
                    ¿Dónde te entregamos?
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Ingresá la calle y el número de tu domicilio.
                  </p>
                </div>

                {/* CALLE + NÚMERO */}

                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="calle"
                      className="font-display text-xs font-semibold text-card-foreground/80"
                    >
                      Calle
                    </label>

                    <Input
                      id="calle"
                      required
                      value={calle}
                      onChange={(event) => {
                        setCalle(
                          event.target
                            .value
                        );

                        limpiarVerificacionDireccion();
                      }}
                      placeholder="Ej: 20"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="numero"
                      className="font-display text-xs font-semibold text-card-foreground/80"
                    >
                      Número
                    </label>

                    <Input
                      id="numero"
                      required
                      value={numero}
                      onChange={(event) => {
                        setNumero(
                          event.target
                            .value
                        );

                        limpiarVerificacionDireccion();
                      }}
                      placeholder="Ej: 1234"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Por ejemplo: Calle 20, número 1234.
                </p>

                {/* BOTÓN VERIFICAR */}

                <Button
                  type="button"
                  variant="lime"
                  onClick={
                    verificarDireccion
                  }
                  disabled={
                    verificandoDireccion ||
                    !calle.trim() ||
                    !numero.trim()
                  }
                  className="w-full"
                >
                  {verificandoDireccion
                    ? "Verificando dirección..."
                    : "📍 Verificar dirección"}
                </Button>

                {/* =================================
                    DIRECCIÓN CONFIRMADA
                ================================== */}

                {direccionVerificada &&
                  zonaEnvio && (
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                      <p className="font-display text-sm font-bold text-green-400">
                        ✓ Dirección verificada
                      </p>

                      <p className="mt-1 text-sm font-semibold text-card-foreground">
                        {direccionEncontrada ||
                          `${calle} ${numero}`}
                      </p>

                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <p>
                          📍 Zona:{" "}
                          <span className="font-semibold text-card-foreground">
                            {
                              zonaEnvio.nombre
                            }
                          </span>
                        </p>

                        <p>
                          🚚 Envío:{" "}
                          <span className="font-semibold text-card-foreground">
                            {formatPrice(
                              zonaEnvio.precio
                            )}
                          </span>
                        </p>

                        <p>
                          🛒 Compra mínima:{" "}
                          <span className="font-semibold text-card-foreground">
                            {formatPrice(
                              zonaEnvio.compraMinima
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                {/* =================================
                    ERROR
                ================================== */}

                {errorDireccion && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm font-medium text-red-400">
                      ❌ {errorDireccion}
                    </p>
                  </div>
                )}
              </div>

              {/* OBSERVACIONES */}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="notes"
                  className="font-display text-xs font-semibold text-card-foreground/80"
                >
                  Observaciones
                </label>

                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  placeholder="Ej: timbre rojo, puerta de rejas..."
                />
              </div>
            </section>

            {/* =====================================
                MÉTODO DE PAGO
            ====================================== */}

            <section className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-soft">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tuki-lime">
                Método de pago
              </h2>

              <div className="flex flex-col gap-2">
                {PAYMENT_METHODS.map(
                  (method) => {
                    const Icon =
                      method.icon;

                    const isSelected =
                      paymentMethod ===
                      method.value;

                    return (
                      <label
                        key={
                          method.value
                        }
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                          isSelected
                            ? "border-tuki-lime bg-tuki-lime/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={
                            method.value
                          }
                          checked={
                            isSelected
                          }
                          onChange={() =>
                            setPaymentMethod(
                              method.value
                            )
                          }
                          className="sr-only"
                        />

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isSelected
                              ? "bg-tuki-lime text-tuki-night"
                              : "bg-white/10 text-card-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>

                        <span className="flex flex-col">
                          <span className="font-display text-sm font-bold text-card-foreground">
                            {
                              method.label
                            }
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {
                              method.helper
                            }
                          </span>
                        </span>
                      </label>
                    );
                  }
                )}
              </div>

              {/* PAGO MIXTO */}

              {paymentMethod ===
                "mixto" && (
                <div className="mt-3 rounded-2xl border border-tuki-lime/20 bg-tuki-night p-4">
                  <p className="font-display text-sm font-bold text-tuki-cream">
                    ¿Cómo vas a dividir el pago?
                  </p>

                  <p className="mt-1 text-xs text-tuki-cream/60">
                    El total debe coincidir exactamente con el pedido.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="montoEfectivo"
                        className="mb-1.5 block text-xs font-semibold text-tuki-cream/70"
                      >
                        💵 Efectivo
                      </label>

                      <Input
                        id="montoEfectivo"
                        type="number"
                        min="0"
                        step="1"
                        value={
                          montoEfectivo
                        }
                        onChange={(event) =>
                          setMontoEfectivo(
                            event.target
                              .value
                          )
                        }
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="montoTransferencia"
                        className="mb-1.5 block text-xs font-semibold text-tuki-cream/70"
                      >
                        🏦 Transferencia
                      </label>

                      <Input
                        id="montoTransferencia"
                        type="number"
                        min="0"
                        step="1"
                        value={
                          montoTransferencia
                        }
                        onChange={(event) =>
                          setMontoTransferencia(
                            event.target
                              .value
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-sm text-tuki-cream/70">
                      Total a pagar
                    </span>

                    <span className="font-bold text-tuki-lime">
                      {formatPrice(
                        total
                      )}
                    </span>
                  </div>

                  <div
                    className={`mt-2 text-right text-sm font-bold ${
                      pagoMixtoValido
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {pagoMixtoValido
                      ? "✓ Los importes coinciden"
                      : `Faltan ${formatPrice(
                          Math.abs(
                            total -
                              totalMixto
                          )
                        )}`}
                  </div>
                </div>
              )}
            </section>

            {/* =====================================
                RESUMEN
            ====================================== */}

            <section
              id="resumen-pedido"
              className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-soft"
            >
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tuki-lime">
                Tu pedido
              </h2>

              <ul className="flex flex-col gap-1.5">
                {items.map(
                  (item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-sm text-card-foreground"
                    >
                      <span className="truncate pr-2">
                        {item.name} x
                        {
                          item.quantity
                        }
                      </span>

                      <span className="shrink-0 font-semibold">
                        {formatPrice(
                          item.price *
                            item.quantity
                        )}
                      </span>
                    </li>
                  )
                )}
              </ul>

              <div className="space-y-2 border-t border-border pt-3">
                {/* SUBTOTAL */}

                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-card-foreground">
                    Subtotal
                  </span>

                  <span>
                    {formatPrice(
                      subtotal
                    )}
                  </span>
                </div>

                {/* COMPRA MÍNIMA */}

                {zonaEnvio && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Compra mínima
                    </span>

                    <span className="text-sm font-semibold">
                      {formatPrice(
                        zonaEnvio.compraMinima
                      )}
                    </span>
                  </div>
                )}

                {/* AVISO COMPRA MÍNIMA */}

                {zonaEnvio &&
                  subtotal <
                    zonaEnvio.compraMinima && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                      Te faltan{" "}
                      {formatPrice(
                        zonaEnvio.compraMinima -
                          subtotal
                      )}{" "}
                      para alcanzar el mínimo de compra.
                    </div>
                  )}

                {/* DESCUENTO */}

                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-green-500">
                      Descuento
                    </span>

                    <span className="text-green-500">
                      -
                      {formatPrice(
                        discount
                      )}
                    </span>
                  </div>
                )}

                {/* ENVÍO */}

                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-card-foreground">
                    Envío
                  </span>

                  {!zonaEnvio ? (
                    <span className="text-sm text-muted-foreground">
                      Se calcula con tu dirección
                    </span>
                  ) : delivery ===
                  0 ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through">
                        {formatPrice(
                          zonaEnvio.precio
                        )}
                      </span>

                      <span className="text-green-500">
                        GRATIS
                      </span>
                    </div>
                  ) : (
                    <span>
                      {formatPrice(
                        delivery
                      )}
                    </span>
                  )}
                </div>

                {/* BENEFICIO APLICADO */}

                {beneficio && (
                  <div className="rounded-2xl border border-tuki-lime/20 bg-tuki-night p-4">
                    <p className="font-display text-xs font-bold uppercase text-tuki-lime">
                      Beneficio aplicado
                    </p>

                    <p className="mt-2 text-sm text-tuki-cream">
                      🎁 {beneficio.titulo}
                    </p>

                    {beneficio.regalo && (
                      <p className="mt-1 text-sm text-tuki-cream/80">
                        {beneficio.regalo}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-tuki-cream/50">
                      Las promociones no se combinan: se aplica la que más te conviene.
                    </p>
                  </div>
                )}

                {/* BENEFICIOS QUE TODAVÍA NO APLICAN */}

                {beneficiosPendientes.map(
                  (pendiente) => (
                    <div
                      key={pendiente.origen}
                      className="rounded-2xl border border-white/10 bg-tuki-night p-3 text-sm text-tuki-cream/80"
                    >
                      ✨ {pendiente.titulo}:{" "}
                      {pendiente.motivo}
                    </div>
                  )
                )}

                {/* CUPÓN */}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={cuponInput}
                      onChange={(e) =>
                        setCuponInput(
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="¿Tenés un cupón?"
                      className="flex-1"
                    />

                    {cuponCodigo ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCuponCodigo("");
                          setCuponInput("");
                          setCupon(null);
                          setCuponError("");
                        }}
                      >
                        Quitar
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          !cuponInput.trim()
                        }
                        onClick={() => {
                          if (!phone) {
                            setCuponError(
                              "Completá tu teléfono para usar un cupón."
                            );
                            return;
                          }

                          setCuponCodigo(
                            cuponInput.trim()
                          );
                        }}
                      >
                        Aplicar
                      </Button>
                    )}
                  </div>

                  {cuponError && (
                    <p className="text-sm text-red-400">
                      {cuponError}
                    </p>
                  )}

                  {cupon &&
                    beneficio &&
                    beneficio.origen !==
                      "CUPON" && (
                      <p className="text-sm text-tuki-cream/70">
                        Tu cupón no se aplicó porque{" "}
                        {beneficio.titulo.toLowerCase()} te
                        conviene más. Lo podés usar en otro
                        pedido.
                      </p>
                    )}
                </div>

                {/* TOTAL */}

                <div className="flex items-center justify-between pt-2">
                  <span className="font-display text-lg font-bold text-card-foreground">
                    {zonaEnvio
                      ? "Total"
                      : "Total sin envío"}
                  </span>

                  <span className="font-display text-xl font-extrabold text-tuki-lime">
                    {formatPrice(
                      total
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* =====================================
                CARGANDO PROMOCIONES
            ====================================== */}

            {loadingHappyHour && (
              <p className="text-center text-sm text-tuki-cream">
                Cargando promociones...
              </p>
            )}

            {/* =====================================
                CONFIRMAR PEDIDO
            ====================================== */}

            <Button
              disabled={
                !abierto ||
                loadingHappyHour ||
                !direccionVerificada ||
                !zonaEnvio ||
                !coordenadasEntrega ||
                !compraMinimaValida ||
                (paymentMethod ===
                  "mixto" &&
                  !pagoMixtoValido)
              }
              type="submit"
              variant="lime"
              size="lg"
              className="w-full"
            >
              Confirmar pedido
            </Button>

            {!direccionVerificada && (
              <p className="text-center text-xs text-tuki-cream/50">
                📍 Primero verificá tu dirección para conocer la zona y el costo de envío.
              </p>
            )}

            {!abierto && (
              <p className="mt-3 text-center text-sm text-tuki-cream">
                🌙 TUKI está cerrado. Volvemos pronto.
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}