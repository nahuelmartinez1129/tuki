"use client";

import { useEffect, useState } from "react";



export default function AdminPage() {

  const [ultimoPedidoId, setUltimoPedidoId] =
  useState<string | null>(null);
    const [abierto, setAbierto] =
  useState<boolean | null>(null);
  const [stats, setStats] =
  useState({
    pedidosHoy: 0,
    facturacion: 0,
    usuarios: 0,
    premios: 0,
    pendientes: 0,
    ultimosPedidos: [],
  });
useEffect(() => {
  if (
    "Notification" in window &&
    Notification.permission !== "granted"
  ) {
    Notification.requestPermission();
  }
}, []);
useEffect(() => {
  async function load() {
    // Configuración
    const response = await fetch(
      "/api/configuracion"
    );

    const data =
      await response.json();

    setAbierto(data.abierto);

    // Dashboard
    const dashboard =
      await fetch(
        "/api/admin/dashboard"
      );

    const statsData =
      await dashboard.json();

    setStats(statsData);
  }

  load();

  const interval =
    setInterval(load, 2000);

  return () =>
    clearInterval(interval);
}, []);
  return (
    <>
      <h1 className="font-display text-3xl
sm:text-4xl
lg:text-3xl
sm:text-4xl
lg:text-5xl font-extrabold text-tuki-cream">
        Dashboard
      </h1>

<div className="mt-4">
  <button
    onClick={async () => {
      const permission =
        await Notification.requestPermission();

      console.log(
        permission
      );
    }}
    className="
      rounded-2xl
      bg-tuki-lime
      px-4
      py-2
      font-bold
      text-black
    "
  >
    Activar notificaciones
  </button>
</div>
      {/* Cards */}
      <div className="mt-10 grid grid
grid-cols-1
sm:grid-cols-2
xl:grid-cols-4 gap-6">
        <div className="rounded-3xl bg-tuki-night-soft p-6">
          <p className="text-sm text-tuki-cream/60">
            Pedidos hoy
          </p>

          <h2 className="mt-2 text-4xl font-bold text-tuki-lime">
            {stats.pedidosHoy}
          </h2>
        </div>

        <div className="rounded-3xl bg-tuki-night-soft p-6">
          <p className="text-sm text-tuki-cream/60">
            Facturación
          </p>

          <h2 className="mt-2 text-4xl font-bold text-tuki-lime">
            ${stats.facturacion}
          </h2>
        </div>

        <div className="rounded-3xl bg-tuki-night-soft p-6">
          <p className="text-sm text-tuki-cream/60">
            Usuarios
          </p>

          <h2 className="mt-2 text-4xl font-bold text-tuki-lime">
            {stats.usuarios}
          </h2>
        </div>

        <div className="rounded-3xl bg-tuki-night-soft p-6">
          <p className="text-sm text-tuki-cream/60">
            Premios entregados
          </p>

          <h2 className="mt-2 text-4xl font-bold text-tuki-lime">
            {stats.premios}
          </h2>
        </div>
      </div>

      {/* Estado */}
      <div className="mt-10 rounded-3xl bg-tuki-night-soft p-8">
        <h2 className="text-2xl font-bold text-tuki-cream">
          Estado actual
        </h2>
      

        <div className="mt-4 flex items-center gap-3">
         <div
  className={`h-4 w-4 rounded-full ${
    abierto
      ? "bg-green-500"
      : "bg-red-500"
  }`}
/>

<span className="font-display text-xl font-bold text-tuki-cream">
  {abierto
    ? "ABIERTO"
    : "CERRADO"}
</span>

        </div>

        <p className="mt-4 text-tuki-cream/70">
  Pedidos pendientes:

  <span className="ml-2 font-bold text-red-500">
    {stats.pendientes}
  </span>
</p>

      </div>

<div className="mt-10 rounded-3xl bg-tuki-night-soft p-8">
  <h2 className="text-2xl font-bold text-tuki-cream">
    Últimos pedidos
  </h2>

  <div className="mt-6 space-y-4">
    {stats.ultimosPedidos?.map(
      (pedido: any) => (
        <div
          key={pedido.id}
          className="
            flex
            items-center
            justify-between
            rounded-2xl
            bg-white/5
            p-4
          "
        >
          <div>
            <p className="font-bold text-tuki-cream">
              #{pedido.numero}
            </p>

            <p className="text-sm text-tuki-cream/60">
              {pedido.nombre}
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold text-tuki-lime">
              ${pedido.total}
            </p>

            <p className="text-sm text-tuki-cream/60">
              {pedido.estado}
            </p>
          </div>
        </div>
      )
    )}
  </div>
</div>

</>
);
}