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
  Wallet,
} from "lucide-react";

import { useAnonymousUser }
from "@/hooks/useAnonymousUser";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import type { CheckoutOrder, PaymentMethod } from "@/types/cart";


const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  helper: string;
  icon: typeof Banknote;
}[] = [
  {
    value: "efectivo",
    label: "Efectivo",
    helper: "Pagás al recibir tu pedido",
    icon: Banknote,
  },
  {
    value: "transferencia",
    label: "Transferencia",
    helper: "Te pasamos el alias al confirmar",
    icon: Landmark,
  },
  
];


export default function CheckoutPage() {
  const anonymousId =
  useAnonymousUser();

const [reward, setReward] =
  useState<{ premio?: string; id?: string } | null>(null);

  const [happyHour, setHappyHour] =
  useState<any>(null);

const [loadingHappyHour, setLoadingHappyHour] =
  useState(true);

const [abierto, setAbierto] =
  useState(true);

  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [submittedOrder, setSubmittedOrder] = useState<CheckoutOrder | null>(
    null
  );

  const isEmpty = items.length === 0;

const BASE_DELIVERY = 800;

let delivery = BASE_DELIVERY;
let discount = 0;
let regalo = "";

const caja = items.find(
  (item) =>
    item.name
      .toLowerCase()
      .includes("caja")
);

// HAPPY HOUR

if (happyHour) {
  if (happyHour.tipo === "ENVIO_GRATIS") {
    delivery = 0;
  }

  if (happyHour.tipo === "DESCUENTO") {
    discount +=
      subtotal *
      (happyHour.valor / 100);
  }

  if (happyHour.tipo === "CUPON_1500") {
    discount += happyHour.valor;
  }

  if (happyHour.tipo === "GOMITAS") {
    regalo +=
      "🍬 Caramelos Gratis (Happy Hour) ";
  }

  if (
    happyHour.tipo === "CAJA_10" &&
    caja
  ) {
    discount +=
      caja.price * 0.1;
  }
}

// RULETA

if (
  reward?.premio &&
  reward.premio !== "SIN_PREMIO"
) {
  if (reward.premio === "ENVIO_GRATIS") {
    delivery = 0;
  }

  if (reward.premio === "DESCUENTO") {
    discount += subtotal * 0.1;
  }

  if (reward.premio === "CUPON_1500") {
    discount += 1500;
  }

  if (reward.premio === "GOMITAS") {
    regalo +=
      "🍬 Gomitas Gratis ";
  }

  if (
    reward.premio === "CAJA_10" &&
    caja
  ) {
    discount +=
      caja.price * 0.1;
  }
}
const total =
  Math.max(
    0,
    subtotal -
      discount +
      delivery
  );



const gomitasGratis =
  happyHour?.tipo === "GOMITAS";

useEffect(() => {
  async function loadReward() {
    if (!anonymousId) return;

    const response = await fetch(
      `/api/rewards?anonymousId=${anonymousId}`
    );

    const data = await response.json();

    console.log(
  "AnonymousId:",
  anonymousId
);

console.log(
  "Reward:",
  data
);

    setReward(data);
  }

  loadReward();
}, [anonymousId]);

useEffect(() => {
  async function loadConfig() {
    const response = await fetch(
      "/api/configuracion"
    );

    const data = await response.json();

    setAbierto(data.abierto);
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

useEffect(() => {
  async function loadHappyHour() {
    try {
      const response = await fetch(
        "/api/happy-hour",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      console.log(
        "HAPPY HOUR:",
        data
      );

      setHappyHour(data);
    } finally {
      setLoadingHappyHour(false);
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

  async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
    event.preventDefault();
    if (isEmpty) return;

    // Mock: en el futuro esto se reemplaza por un POST a /api/orders.
    const order: CheckoutOrder = {
      customerName,
      phone,
      address,
      notes,
      paymentMethod,
      items,
      subtotal,
      total,
      reward: reward?.premio,
      
    };

   


if (
  reward?.premio &&
  reward.premio !== "SIN_PREMIO"
) {
  await fetch(
    "/api/rewards/use",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        rewardId: reward.id,
      }),
    }
  );

  setReward(null);
}



const response = await fetch(
  "/api/pedidos",
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },

    body: JSON.stringify({
       anonymousId,
  nombre: customerName,
  telefono: phone,
  direccion: address,

  subtotal,
  descuento: discount,
  envio: delivery,

  premio: reward?.premio,
  happyHour: happyHour?.titulo,

  metodoPago: paymentMethod,

  total,

  observaciones: notes,

  items: items.map((item) => ({
    nombre: item.name,
    cantidad: item.quantity,
    precio: item.price,
  })),
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

window.location.href =
  `/pedido-exitoso/${pedido.numero}`;

setTimeout(() => {
  clearCart();
}, 1000);
  }

  if (submittedOrder) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-tuki-lime/15">
          <CheckCircle2 className="h-8 w-8 text-tuki-lime" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            ¡Pedido recibido!
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Gracias {submittedOrder.customerName || "por tu pedido"}, la noche ya está preparando algo rico para vos. 🍬. Te contactamos al {submittedOrder.phone} para
            coordinar la entrega.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-3xl bg-card p-5 text-left shadow-soft">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-tuki-lime">
            Resumen
          </p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {submittedOrder.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm text-card-foreground"
              >
                <span className="truncate pr-2">
                  {item.name} x{item.quantity}
                </span>
                <span className="shrink-0 font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-border pt-3 space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-sm text-card-foreground">
      Subtotal
    </span>
    <span className="font-semibold">
      {formatPrice(submittedOrder.subtotal)}
    </span>

{discount > 0 && (
  <div className="flex items-center justify-between">
    <span className="font-display text-sm font-bold text-green-500">
      Descuento
    </span>

    <span className="text-green-500">
      -{formatPrice(discount)}
    </span>
  </div>
)}
    
  </div>

  <div className="flex items-center justify-between">
    <span className="text-sm text-card-foreground">
      Envío
    </span>

    <span className="font-semibold">
      {formatPrice(delivery)}
    </span>
  </div>
{regalo && (
  <div className="rounded-xl bg-green-500/10 p-3 text-sm text-green-400">
    {regalo}
  </div>
)}
  <div className="flex items-center justify-between border-t border-border pt-2">
    <span className="font-display text-sm font-bold text-card-foreground">
      Total
    </span>

    <span className="font-display text-lg font-extrabold text-tuki-lime">
      {formatPrice(submittedOrder.total)}
    </span>
  </div>
</div>
        </div>

        <Button variant="lime" size="lg" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl">
        <button
          type="button"
          onClick={() => router.back()}
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
            <Button variant="lime" asChild>
              <Link href="/">Ver antojos</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
            {/* Datos de contacto y entrega */}
            <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-soft">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tuki-lime">
                Datos de entrega
              </h2>

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
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="¿Cómo te llamás?"
                />
              </div>

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
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="11 2345 6789"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="address"
                  className="font-display text-xs font-semibold text-card-foreground/80"
                >
                  Dirección
                </label>
                <Input
                  id="address"
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Calle, número, piso/depto"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="notes"
                  className="font-display text-xs font-semibold text-card-foreground/80"
                >
                  Referencias (opcional)
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Timbre, color de puerta, entre calles..."
                />
              </div>
            </section>

            {/* Método de pago */}
            <section className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-soft">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tuki-lime">
                Método de pago
              </h2>

              <div className="flex flex-col gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.value;
                  const isDisabled = method.value === "mercado-pago";

                  return (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                        isSelected
                          ? "border-tuki-lime bg-tuki-lime/10"
                          : "border-white/10 bg-white/5"
                      } ${isDisabled ? "opacity-50" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => setPaymentMethod(method.value)}
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
                          {method.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {method.helper}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Resumen del pedido */}
            <section className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-soft">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-tuki-lime">
                Tu pedido
              </h2>
              <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-sm text-card-foreground"
                  >
                    <span className="truncate pr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="shrink-0 font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-3 space-y-2">
  <div className="flex items-center justify-between">
    <span className="font-display text-sm font-bold text-card-foreground">
      Subtotal
    </span>

    <span>{formatPrice(subtotal)}</span>
  </div>

{discount > 0 && (
  <div className="flex items-center justify-between">
    <span className="text-green-500">
      Descuento
    </span>

    <span className="text-green-500">
      -{formatPrice(discount)}
    </span>
  </div>
)}
  <div className="flex items-center justify-between">
    <span className="font-display text-sm font-bold text-card-foreground">
      Envío
    </span>

    

{delivery === 0 ? (
  <div className="flex items-center gap-2">
    <span className="line-through">
      {formatPrice(BASE_DELIVERY)}
    </span>

    <span className="text-green-500">
      GRATIS
    </span>
  </div>
) : (
  <span>
    {formatPrice(delivery)}
  </span>
)}
  </div>
{(reward?.premio || happyHour) && (
  <div className="rounded-2xl border border-tuki-lime/20 bg-tuki-night p-4">
   

 {reward?.premio && (
  <>
    <p className="font-display text-xs font-bold uppercase text-tuki-lime">
      PREMIO DE LA RULETA
    </p>

    <p className="mt-2 text-sm text-tuki-cream">
      🎁 {reward.premio}
    </p>
  </>
)}

{happyHour && (
  <>
    <p className="mt-4 font-display text-xs font-bold uppercase text-tuki-lime">
      HAPPY HOUR
    </p>

    <p className="mt-2 text-sm text-tuki-cream">
      🔥 {happyHour.titulo}
    </p>
  </>
)}
  </div>
)}
  <div className="flex items-center justify-between pt-2">
    <span className="font-display text-lg font-bold text-card-foreground">
      Total
    </span>

    <span className="font-display text-xl font-extrabold text-tuki-lime">
      {formatPrice(total)}
    </span>
  </div>
</div>
            </section>
{loadingHappyHour && (
  <p className="text-center text-sm text-tuki-cream">
    Cargando promociones...
  </p>
)}
            <Button disabled={
  !abierto ||
  loadingHappyHour
} type="submit" variant="lime" size="lg" className="w-full">
              Confirmar pedido
            </Button>

            {!abierto && (
  <p className="mt-3 text-center text-sm text-tuki-cream">
    🌙 TUKI está descansando. Volvemos pronto.
  </p>
)}
          </form>
        )}
      </div>
    </main>
  );
}
