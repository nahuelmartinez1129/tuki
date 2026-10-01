"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { PuntoPoligono } from "@/components/admin/MapaZonasEnvio";

const MapaZonasEnvio = dynamic(
  () => import("@/components/admin/MapaZonasEnvio"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-tuki-cream/50">
        Cargando mapa...
      </div>
    ),
  }
);

type ZonaEnvio = {
  id: string;
  nombre: string;
  precio: number;
  compraMinima: number;
  activo: boolean;
  orden: number;
  poligono: PuntoPoligono[] | null;
  createdAt: string;
  updatedAt: string;
};

const zonaInicial = {
  nombre: "",
  precio: "",
  compraMinima: "",
  activo: true,
  orden: "0",
  poligono: [] as PuntoPoligono[],
};

export default function ZonasEnvioPage() {
  const [zonas, setZonas] = useState<ZonaEnvio[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(zonaInicial);

  const [editandoId, setEditandoId] = useState<string | null>(
    null
  );

  async function cargarZonas() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/zonas-envio");

      if (!response.ok) {
        throw new Error("No se pudieron cargar las zonas");
      }

      const data = await response.json();

      setZonas(data);
    } catch (error) {
      console.error(error);

      setError(
        "No se pudieron cargar las zonas de envío."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarZonas();
  }, []);

  function limpiarFormulario() {
    setForm({
      nombre: "",
      precio: "",
      compraMinima: "",
      activo: true,
      orden: "0",
      poligono: [],
    });

    setEditandoId(null);
  }

  function editarZona(zona: ZonaEnvio) {
    setEditandoId(zona.id);

    setForm({
      nombre: zona.nombre,
      precio: String(zona.precio),
      compraMinima: String(zona.compraMinima),
      activo: zona.activo,
      orden: String(zona.orden),
      poligono: zona.poligono ?? [],
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function guardarZona(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setGuardando(true);
      setError("");

      if (form.poligono.length < 3) {
        throw new Error(
          "La zona debe tener al menos 3 puntos en el mapa."
        );
      }

      const payload = {
        nombre: form.nombre,
        precio: Number(form.precio),
        compraMinima: Number(form.compraMinima),
        activo: form.activo,
        orden: Number(form.orden),
        poligono: form.poligono,
      };

      const url = editandoId
        ? `/api/zonas-envio/${editandoId}`
        : "/api/zonas-envio";

      const method = editandoId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo guardar la zona"
        );
      }

      limpiarFormulario();

      await cargarZonas();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la zona."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(zona: ZonaEnvio) {
    try {
      setError("");

      const response = await fetch(
        `/api/zonas-envio/${zona.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activo: !zona.activo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo cambiar el estado"
        );
      }

      await cargarZonas();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado de la zona."
      );
    }
  }

  async function eliminarZona(zona: ZonaEnvio) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar "${zona.nombre}"?`
    );

    if (!confirmar) return;

    try {
      setError("");

      const response = await fetch(
        `/api/zonas-envio/${zona.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo eliminar la zona"
        );
      }

      if (editandoId === zona.id) {
        limpiarFormulario();
      }

      await cargarZonas();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la zona."
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ENCABEZADO */}
      <div>
        <h1 className="text-3xl font-bold text-tuki-cream">
          Zonas de envío
        </h1>

        <p className="mt-2 text-tuki-cream/60">
          Configurá el precio de envío, la compra mínima y
          el área de reparto para cada zona.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      <form
        onSubmit={guardarZona}
        className="rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-tuki-cream">
              {editandoId
                ? "Editar zona"
                : "Nueva zona"}
            </h2>

            <p className="text-sm text-tuki-cream/50">
              {editandoId
                ? "Modificá los datos y el área de la zona."
                : "Creá una nueva zona de reparto."}
            </p>
          </div>

          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-tuki-cream/70 transition hover:bg-white/5"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* DATOS DE LA ZONA */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* NOMBRE */}
          <div>
            <label className="mb-2 block text-sm text-tuki-cream/70">
              Nombre
            </label>

            <input
              type="text"
              value={form.nombre}
              onChange={(e) =>
                setForm({
                  ...form,
                  nombre: e.target.value,
                })
              }
              placeholder="Ej: Zona Centro"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-tuki-cream outline-none focus:border-tuki-lime"
            />
          </div>

          {/* PRECIO */}
          <div>
            <label className="mb-2 block text-sm text-tuki-cream/70">
              Precio de envío
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={form.precio}
              onChange={(e) =>
                setForm({
                  ...form,
                  precio: e.target.value,
                })
              }
              placeholder="Ej: 900"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-tuki-cream outline-none focus:border-tuki-lime"
            />
          </div>

          {/* COMPRA MINIMA */}
          <div>
            <label className="mb-2 block text-sm text-tuki-cream/70">
              Compra mínima
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={form.compraMinima}
              onChange={(e) =>
                setForm({
                  ...form,
                  compraMinima: e.target.value,
                })
              }
              placeholder="Ej: 3500"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-tuki-cream outline-none focus:border-tuki-lime"
            />
          </div>

          {/* ORDEN */}
          <div>
            <label className="mb-2 block text-sm text-tuki-cream/70">
              Orden
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={form.orden}
              onChange={(e) =>
                setForm({
                  ...form,
                  orden: e.target.value,
                })
              }
              placeholder="Ej: 1"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-tuki-cream outline-none focus:border-tuki-lime"
            />
          </div>
        </div>

        {/* ACTIVA */}
        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-tuki-cream/70">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) =>
              setForm({
                ...form,
                activo: e.target.checked,
              })
            }
            className="h-4 w-4"
          />

          Zona activa
        </label>

        {/* MAPA */}
        <div className="mt-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-tuki-cream">
              📍 Área de reparto
            </h3>

            <p className="mt-1 text-sm leading-6 text-tuki-cream/50">
              Hacé clic sobre el mapa para marcar los
              límites de esta zona. Necesitás al menos 3
              puntos.
            </p>
          </div>

          <MapaZonasEnvio
            puntos={form.poligono}
            onChange={(puntos) =>
              setForm({
                ...form,
                poligono: puntos,
              })
            }
          />
        </div>

        {/* RESUMEN DE PUNTOS */}
        <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-tuki-cream">
                Puntos de la zona
              </p>

              <p className="mt-1 text-sm text-tuki-cream/50">
                {form.poligono.length === 0
                  ? "Todavía no marcaste ningún punto."
                  : `${form.poligono.length} punto${
                      form.poligono.length === 1
                        ? ""
                        : "s"
                    } marcado${
                      form.poligono.length === 1
                        ? ""
                        : "s"
                    }.`}
              </p>
            </div>

            {form.poligono.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    poligono: [],
                  })
                }
                className="rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
              >
                Limpiar puntos
              </button>
            )}
          </div>
        </div>

        {/* GUARDAR */}
        <button
          type="submit"
          disabled={guardando}
          className="mt-6 rounded-xl bg-tuki-lime px-6 py-3 font-semibold text-tuki-night transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando
            ? "Guardando..."
            : editandoId
            ? "Guardar cambios"
            : "Crear zona"}
        </button>
      </form>

      {/* ZONAS CONFIGURADAS */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-tuki-cream">
          Zonas configuradas
        </h2>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-tuki-cream/60">
            Cargando zonas...
          </div>
        ) : zonas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-tuki-cream/50">
            Todavía no hay zonas de envío configuradas.
          </div>
        ) : (
          <div className="grid gap-4">
            {zonas.map((zona) => (
              <div
                key={zona.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-tuki-cream">
                        {zona.nombre}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          zona.activo
                            ? "bg-green-400/10 text-green-300"
                            : "bg-red-400/10 text-red-300"
                        }`}
                      >
                        {zona.activo
                          ? "Activa"
                          : "Inactiva"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-tuki-cream/60 sm:grid-cols-3">
                      <span>
                        🚚 Envío:{" "}
                        <strong className="text-tuki-cream">
                          $
                          {zona.precio.toLocaleString(
                            "es-AR"
                          )}
                        </strong>
                      </span>

                      <span>
                        🛒 Mínimo:{" "}
                        <strong className="text-tuki-cream">
                          $
                          {zona.compraMinima.toLocaleString(
                            "es-AR"
                          )}
                        </strong>
                      </span>

                      <span>
                        Orden:{" "}
                        <strong className="text-tuki-cream">
                          {zona.orden}
                        </strong>
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-tuki-cream/50">
                      📍{" "}
                      {zona.poligono &&
                      zona.poligono.length >= 3
                        ? `${zona.poligono.length} puntos definidos`
                        : "Sin área de reparto definida"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        cambiarEstado(zona)
                      }
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-tuki-cream/70 transition hover:bg-white/5"
                    >
                      {zona.activo
                        ? "Desactivar"
                        : "Activar"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        editarZona(zona)
                      }
                      className="rounded-lg border border-tuki-lime/30 px-4 py-2 text-sm text-tuki-lime transition hover:bg-tuki-lime/10"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        eliminarZona(zona)
                      }
                      className="rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}