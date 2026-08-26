"use client";

import { useEffect, useState } from "react";

type HistorialFacturacion = {
  fecha: string;
  pedidos: number;
  facturacion: number;
};

export default function AdminPage() {
  const [ultimoPedidoId, setUltimoPedidoId] =
    useState<string | null>(null);

  const [abierto, setAbierto] =
    useState<boolean | null>(null);

  const [envio, setEnvio] =
    useState(900);

  const [stats, setStats] =
    useState<{
      pedidosHoy: number;
      facturacion: number;
      usuarios: number;
      premios: number;
      pendientes: number;
      ultimosPedidos: any[];
      historialFacturacion: HistorialFacturacion[];
    }>({
      pedidosHoy: 0,
      facturacion: 0,
      usuarios: 0,
      premios: 0,
      pendientes: 0,
      ultimosPedidos: [],
      historialFacturacion: [],
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
    async function loadConfiguracion() {
      const response =
        await fetch(
          "/api/configuracion"
        );

      const data =
        await response.json();

      setAbierto(
        data.abierto
      );

      setEnvio(
        data.envio ?? 900
      );
    }

    async function loadDashboard() {
      const dashboard =
        await fetch(
          "/api/admin/dashboard"
        );

      const statsData =
        await dashboard.json();

      setStats(statsData);
    }

    loadConfiguracion();
    loadDashboard();

    const interval =
      setInterval(
        loadDashboard,
        2000
      );

    return () =>
      clearInterval(interval);
  }, []);

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
      <div
        className="
          mt-10
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
      >
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
            Facturación hoy
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

        <div className="mt-8">
          <label className="mb-2 block text-sm text-tuki-cream/70">
            Precio del envío
          </label>

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={envio}
              onChange={(e) =>
                setEnvio(
                  Number(
                    e.target.value
                  )
                )
              }
              className="
                w-36
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-3
                py-2
                text-tuki-cream
              "
            />

            <button
              onClick={async () => {
                await fetch(
                  "/api/configuracion/update",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body:
                      JSON.stringify({
                        abierto,
                        envio,
                      }),
                  }
                );

                alert(
                  "Envío actualizado"
                );
              }}
              className="
                rounded-xl
                bg-tuki-lime
                px-4
                py-2
                font-bold
                text-black
              "
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Historial de facturación */}
      <div className="mt-10 rounded-3xl bg-tuki-night-soft p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-tuki-cream">
              Historial de facturación
            </h2>

            <p className="mt-1 text-sm text-tuki-cream/60">
              Pedidos entregados registrados por día.
            </p>
          </div>

          <div className="rounded-xl bg-tuki-lime/10 px-4 py-2">
            <span className="text-sm font-bold text-tuki-lime">
              {stats.historialFacturacion.length} días registrados
            </span>
          </div>
        </div>

        {stats.historialFacturacion.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white/5 p-6 text-center">
            <p className="text-tuki-cream/60">
              Todavía no hay ventas entregadas registradas.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 text-sm font-bold text-tuki-cream/50">
                    Fecha
                  </th>

                  <th className="pb-3 text-sm font-bold text-tuki-cream/50">
                    Pedidos
                  </th>

                  <th className="pb-3 text-right text-sm font-bold text-tuki-cream/50">
                    Facturación
                  </th>
                </tr>
              </thead>

              <tbody>
                {stats.historialFacturacion.map(
                  (dia) => (
                    <tr
                      key={dia.fecha}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-4 text-tuki-cream">
                        {dia.fecha}
                      </td>

                      <td className="py-4 text-tuki-cream/70">
                        {dia.pedidos}
                      </td>

                      <td className="py-4 text-right font-bold text-tuki-lime">
                        ${dia.facturacion}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Últimos pedidos */}
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