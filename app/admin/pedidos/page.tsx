"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";

export default function PedidosPage() {
  const [
    pedidos,
    setPedidos,
  ] = useState<any[]>([]);

 const audioEnabled =
  useRef(false);

const ultimoPedidoId =
  useRef<string | null>(null);
  

async function load() {
  const response = await fetch(
    "/api/pedidos/all"
  );

  const data = await response.json();

  setPedidos(data);

 if (data.length === 0) {
  return;
}

const pedidoMasNuevo =
  data[0];

if (
  !ultimoPedidoId.current
) {
  ultimoPedidoId.current =
    pedidoMasNuevo.id;

  return;
}

if (
  pedidoMasNuevo.id !==
  ultimoPedidoId.current
) {
  console.log(
    "NUEVO PEDIDO"
  );

  console.log(
  "audioEnabled:",
  audioEnabled
);
if (
  audioEnabled.current
) {
  new Audio(
    "/sounds/new-order.mp3"
  )
    .play()
    .catch(console.log);
}

  if (
    Notification.permission ===
    "granted"
  ) {
    new Notification(
      `Nuevo pedido #${pedidoMasNuevo.numero}`,
      {
        body: `${pedidoMasNuevo.nombre} - $${pedidoMasNuevo.total}`,
      }
    );
  }

  ultimoPedidoId.current =
    pedidoMasNuevo.id;
}
}

  useEffect(() => {
    load();

    const interval =
      setInterval(load, 2000);

    return () =>
      clearInterval(interval);

  }, []);

  useEffect(() => {
  const enableAudio = () => {
    const audio = new Audio(
      "/sounds/new-order.mp3"
    );

    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;

        audioEnabled.current =
  true;

        console.log(
          "AUDIO DESBLOQUEADO"
        );
      })
      .catch(console.log);

    window.removeEventListener(
      "click",
      enableAudio
    );
  };

  window.addEventListener(
    "click",
    enableAudio
  );

  return () =>
    window.removeEventListener(
      "click",
      enableAudio
    );
}, []);

  async function actualizarEstado(
  id: string,
  estado: string
) {
  await fetch(
    "/api/pedidos/update",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        id,
        estado,
      }),
    }
  );

  load();
}
  return (
    <>
      <h1 className="text-3xl
sm:text-4xl
lg:text-5xl font-bold text-tuki-cream">
        Pedidos
      </h1>

      <div className="mt-10 space-y-5">

        {pedidos.map((p) => (
          <div
            key={p.id}
            className="
              rounded-3xl
              bg-tuki-night-soft
              p-6
              shadow-lg
            "
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-tuki-cream">
                Pedido #{p.numero}
              </h2>

              <span
                className="
                  rounded-full
                  bg-yellow-500/10
                  px-3
                  py-1
                  text-sm
                  font-bold
                  text-yellow-500
                "
              >
                {p.estado}
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <p className="text-tuki-cream">
                <strong>Cliente:</strong>{" "}
                {p.nombre}
              </p>

              <p className="text-tuki-cream/70">
                <strong>Teléfono:</strong>{" "}
                {p.telefono}
              </p>

              <p className="text-tuki-cream/70">
                <strong>Dirección:</strong>{" "}
                {p.direccion}
              </p>

              <p className="text-tuki-cream/70">
  <strong>Método de pago:</strong>{" "}
  {p.metodoPago === "efectivo"
    ? "💵 Efectivo"
    : p.metodoPago === "transferencia"
    ? "🏦 Transferencia"
    : "No especificado"}
</p>
            </div>

            <div className="mt-4">
              <p className="font-bold text-tuki-lime">
                Productos
              </p>

              <ul className="mt-2 space-y-1">
                {p.items.map(
                  (item: any) => (
                    <li
                      key={item.id}
                      className="text-sm text-tuki-cream/80"
                    >
                      • {item.nombre} x
                      {item.cantidad}
                    </li>
                  )
                )}
              </ul>
            </div>

            {p.premio && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3">
                <p className="text-green-500 font-bold">
                  🎁 Premio:
                  {" "}
                  {p.premio}
                </p>
              </div>
            )}

            {p.happyHour && (
              <div className="mt-3 rounded-xl bg-orange-500/10 p-3">
                <p className="font-bold text-orange-400">
                  🔥 Happy Hour:
                  {" "}
                  {p.happyHour}
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-tuki-cream/70">
                Subtotal:
                {" "}
                ${p.subtotal}
              </p>

              <p className="text-green-500">
                Descuento:
                {" "}
                -${p.descuento}
              </p>

              <p className="text-tuki-cream/70">
                Envío:
                {" "}
                ${p.envio}
              </p>

              <p className="mt-2 text-2xl font-bold text-tuki-lime">
                TOTAL:
                {" "}
                ${p.total}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">

  <button
    onClick={() =>
      actualizarEstado(
        p.id,
        "CONFIRMADO"
      )
    }
    className="rounded-xl bg-blue-500 px-4 py-2 text-white"
  >
    Confirmar
  </button>

  <button
    onClick={() =>
      actualizarEstado(
        p.id,
        "PREPARANDO"
      )
    }
    className="rounded-xl bg-yellow-500 px-4 py-2 text-black"
  >
    Preparando
  </button>

  <button
    onClick={() =>
      actualizarEstado(
        p.id,
        "EN_CAMINO"
      )
    }
    className="rounded-xl bg-purple-500 px-4 py-2 text-white"
  >
    En Camino
  </button>

  <button
    onClick={() =>
      actualizarEstado(
        p.id,
        "ENTREGADO"
      )
    }
    className="rounded-xl bg-green-600 px-4 py-2 text-white"
  >
    Entregado
  </button>

  <button
    onClick={() =>
      actualizarEstado(
        p.id,
        "CANCELADO"
      )
    }
    className="rounded-xl bg-red-500 px-4 py-2 text-white"
  >
    Cancelar
  </button>

</div>
          </div>
        ))}

      </div>
    </>
  );
}