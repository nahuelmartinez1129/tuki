"use client";

import { useEffect, useState } from "react";

import { textoHappyHour } from "@/lib/promociones";

type HappyHour = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  valor: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean;
  createdAt: string;
};

type FormData = {
  titulo: string;
  descripcion: string;
  tipo: string;
  valor: string;
  fechaInicio: string;
  fechaFin: string;
};

const initialForm: FormData = {
  titulo: "",
  descripcion: "",
  tipo: "ENVIO_GRATIS",
  valor: "",
  fechaInicio: "",
  fechaFin: "",
};

const tiposHappyHour = [
  {
    value: "ENVIO_GRATIS",
    label: "🚚 Envío gratis",
    description: "El cliente no paga el costo de envío.",
    requiresValue: false,
  },
  {
    value: "DESCUENTO",
    label: "💸 Descuento en el pedido",
    description: "Descuento porcentual sobre el subtotal.",
    requiresValue: true,
  },
  {
    value: "CAJA_10",
    label: "📦 Descuento en cajas",
    description: "Descuento porcentual sobre las cajas.",
    requiresValue: true,
  },
  {
    value: "GOMITAS",
    label: "🍬 Gomitas / caramelos gratis",
    description: "Regalo con la compra.",
    requiresValue: false,
  },
  {
    value: "GUAYMALLEN",
    label: "🍫 Alfajor gratis",
    description: "Regalo de un alfajor con la compra.",
    requiresValue: false,
  },
];

export default function HappyHourPage() {
  const [happyHours, setHappyHours] = useState<HappyHour[]>([]);

  const [form, setForm] = useState<FormData>(initialForm);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // CARGAR HAPPY HOURS
  // --------------------------------------------------

  async function loadHappyHours() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/happy-hour/all", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los Happy Hours.");
      }

      const data = await response.json();

      setHappyHours(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los Happy Hours.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHappyHours();
  }, []);

  // --------------------------------------------------
  // MENSAJES
  // --------------------------------------------------

  function showSuccess(message: string) {
    setSuccess(message);
    setError("");

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  function showError(message: string) {
    setError(message);
    setSuccess("");
  }

  // --------------------------------------------------
  // FORMULARIO
  // --------------------------------------------------

  function handleChange(
    field: keyof FormData,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function editarHappyHour(happyHour: HappyHour) {
    setEditingId(happyHour.id);

    setForm({
      titulo: happyHour.titulo ?? "",
      descripcion: happyHour.descripcion ?? "",
      tipo: happyHour.tipo ?? "ENVIO_GRATIS",
      valor:
        happyHour.valor !== null && happyHour.valor !== undefined
          ? String(happyHour.valor)
          : "",
      fechaInicio: happyHour.fechaInicio
        ? convertirParaDatetimeLocal(happyHour.fechaInicio)
        : "",
      fechaFin: happyHour.fechaFin
        ? convertirParaDatetimeLocal(happyHour.fechaFin)
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function convertirParaDatetimeLocal(fecha: string) {
    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const offset = date.getTimezoneOffset();

    const localDate = new Date(
      date.getTime() - offset * 60 * 1000
    );

    return localDate.toISOString().slice(0, 16);
  }

  // --------------------------------------------------
  // CREAR / EDITAR
  // --------------------------------------------------

  async function guardarHappyHour(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // ----------------------------------------------
      // VALIDACIONES
      // ----------------------------------------------

      if (!form.titulo.trim()) {
        throw new Error("Ingresá un título.");
      }

      if (!form.descripcion.trim()) {
        throw new Error("Ingresá una descripción.");
      }

      if (!form.tipo) {
        throw new Error("Seleccioná un tipo de promoción.");
      }

      const tipoSeleccionado = tiposHappyHour.find(
        (tipo) => tipo.value === form.tipo
      );

      if (!tipoSeleccionado) {
        throw new Error("El tipo de promoción no es válido.");
      }

      let valor: number | null = null;

      if (tipoSeleccionado.requiresValue) {
        if (!form.valor.trim()) {
          throw new Error(
            "Este tipo de promoción necesita un porcentaje."
          );
        }

        valor = Number(form.valor);

        if (
          Number.isNaN(valor) ||
          valor <= 0 ||
          valor > 10
        ) {
          throw new Error(
            "El porcentaje debe estar entre 1 y 10."
          );
        }
      }

      // ----------------------------------------------
      // VALIDAR FECHAS
      // ----------------------------------------------

      let fechaInicio: string | null = null;
      let fechaFin: string | null = null;

      if (form.fechaInicio) {
        fechaInicio = new Date(
          form.fechaInicio
        ).toISOString();
      }

      if (form.fechaFin) {
        fechaFin = new Date(
          form.fechaFin
        ).toISOString();
      }

      if (
        fechaInicio &&
        fechaFin &&
        new Date(fechaFin) <= new Date(fechaInicio)
      ) {
        throw new Error(
          "La fecha de finalización debe ser posterior a la fecha de inicio."
        );
      }

      // ----------------------------------------------
      // DATOS
      // ----------------------------------------------

      const body = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        valor,
        fechaInicio,
        fechaFin,
      };

      // ----------------------------------------------
      // CREAR
      // ----------------------------------------------

      if (!editingId) {
        const response = await fetch("/api/happy-hour", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "No se pudo crear el Happy Hour."
          );
        }

        showSuccess("Happy Hour creado correctamente.");
      }

      // ----------------------------------------------
      // EDITAR
      // ----------------------------------------------

      if (editingId) {
        const response = await fetch(
          `/api/happy-hour/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "No se pudo actualizar el Happy Hour."
          );
        }

        showSuccess(
          "Happy Hour actualizado correctamente."
        );
      }

      resetForm();
      await loadHappyHours();
    } catch (error) {
      console.error(error);

      showError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // ACTIVAR
  // --------------------------------------------------

  async function activar(id: string) {
    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/happy-hour/activate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo activar el Happy Hour."
        );
      }

      showSuccess(
        "Happy Hour activado correctamente."
      );

      await loadHappyHours();
    } catch (error) {
      console.error(error);

      showError(
        error instanceof Error
          ? error.message
          : "No se pudo activar el Happy Hour."
      );
    } finally {
      setActionLoading(null);
    }
  }

  // --------------------------------------------------
  // DESACTIVAR TODOS
  // --------------------------------------------------

  async function desactivarTodos() {
    try {
      setActionLoading("all");
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/happy-hour/deactivate",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudieron desactivar los Happy Hours."
        );
      }

      showSuccess(
        "Todos los Happy Hours fueron desactivados."
      );

      await loadHappyHours();
    } catch (error) {
      console.error(error);

      showError(
        error instanceof Error
          ? error.message
          : "No se pudieron desactivar los Happy Hours."
      );
    } finally {
      setActionLoading(null);
    }
  }

  // --------------------------------------------------
  // ELIMINAR
  // --------------------------------------------------

  async function eliminar(id: string) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este Happy Hour? Esta acción no se puede deshacer."
    );

    if (!confirmar) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/happy-hour/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo eliminar el Happy Hour."
        );
      }

      if (editingId === id) {
        resetForm();
      }

      showSuccess(
        "Happy Hour eliminado correctamente."
      );

      await loadHappyHours();
    } catch (error) {
      console.error(error);

      showError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el Happy Hour."
      );
    } finally {
      setActionLoading(null);
    }
  }

  // --------------------------------------------------
  // FORMATEAR FECHAS
  // --------------------------------------------------

  function formatearFecha(fecha: string | null) {
    if (!fecha) {
      return "Sin fecha";
    }

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return date.toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  // --------------------------------------------------
  // LABEL DEL TIPO
  // --------------------------------------------------

  function obtenerLabelTipo(tipo: string) {
    const encontrado = tiposHappyHour.find(
      (item) => item.value === tipo
    );

    return encontrado?.label ?? tipo;
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  const tipoActual = tiposHappyHour.find(
    (tipo) => tipo.value === form.tipo
  );

  return (
    <div className="pb-10">
      {/* ==================================================
          ENCABEZADO
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tuki-cream sm:text-4xl lg:text-5xl">
            Happy Hour
          </h1>

          <p className="mt-2 text-sm text-tuki-cream/60">
            Creá y administrá las promociones que aparecen
            en TUKI.
          </p>
        </div>

        <button
          onClick={desactivarTodos}
          disabled={actionLoading === "all"}
          className="rounded-2xl bg-red-500 px-5 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLoading === "all"
            ? "Desactivando..."
            : "Desactivar todos"}
        </button>
      </div>

      {/* ==================================================
          MENSAJES
      ================================================== */}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-semibold text-green-400">
          {success}
        </div>
      )}

      {/* ==================================================
          FORMULARIO
      ================================================== */}

      <div className="mt-8 rounded-3xl bg-tuki-night-soft p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-tuki-cream">
              {editingId
                ? "Editar Happy Hour"
                : "Crear Happy Hour"}
            </h2>

            <p className="mt-1 text-sm text-tuki-cream/50">
              Configurá la promoción desde acá.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-tuki-cream transition hover:bg-white/5"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form
          onSubmit={guardarHappyHour}
          className="space-y-6"
        >
          {/* TÍTULO */}

          <div>
            <label className="mb-2 block text-sm font-bold text-tuki-cream">
              Título
            </label>

            <input
              type="text"
              value={form.titulo}
              onChange={(e) =>
                handleChange("titulo", e.target.value)
              }
              placeholder="Ej: Happy Hour de viernes"
              className="w-full rounded-2xl border border-white/10 bg-tuki-night px-4 py-3 text-tuki-cream outline-none transition placeholder:text-tuki-cream/30 focus:border-tuki-lime"
            />
          </div>

          {/* DESCRIPCIÓN */}

          <div>
            <label className="mb-2 block text-sm font-bold text-tuki-cream">
              Descripción
            </label>

            <textarea
              value={form.descripcion}
              onChange={(e) =>
                handleChange(
                  "descripcion",
                  e.target.value
                )
              }
              placeholder="Ej: ¡Envío gratis hasta las 22:30 hs!"
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-tuki-night px-4 py-3 text-tuki-cream outline-none transition placeholder:text-tuki-cream/30 focus:border-tuki-lime"
            />

            <p className="mt-2 text-xs text-tuki-cream/50">
              No hace falta escribir la compra mínima: la web la
              agrega sola en el banner y en el cartel
              {textoHappyHour({
                tipo: form.tipo,
                valor: Number(form.valor) || null,
              })
                ? ` («${textoHappyHour({
                    tipo: form.tipo,
                    valor: Number(form.valor) || null,
                  })}»)`
                : ""}
              .
            </p>
          </div>

          {/* TIPO */}

          <div>
            <label className="mb-2 block text-sm font-bold text-tuki-cream">
              Tipo de promoción
            </label>

            <select
              value={form.tipo}
              onChange={(e) =>
                handleChange("tipo", e.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-tuki-night px-4 py-3 text-tuki-cream outline-none transition focus:border-tuki-lime"
            >
              {tiposHappyHour.map((tipo) => (
                <option
                  key={tipo.value}
                  value={tipo.value}
                >
                  {tipo.label}
                </option>
              ))}
            </select>

            {tipoActual && (
              <p className="mt-2 text-xs text-tuki-cream/50">
                {tipoActual.description}
              </p>
            )}
          </div>

          {/* VALOR */}

          {tipoActual?.requiresValue && (
            <div>
              <label className="mb-2 block text-sm font-bold text-tuki-cream">
                Porcentaje de descuento
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.valor}
                  onChange={(e) =>
                    handleChange(
                      "valor",
                      e.target.value
                    )
                  }
                  placeholder="Ej: 10"
                  className="w-full rounded-2xl border border-white/10 bg-tuki-night px-4 py-3 pr-12 text-tuki-cream outline-none transition placeholder:text-tuki-cream/30 focus:border-tuki-lime"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-tuki-cream/50">
                  %
                </span>
              </div>
            </div>
          )}

          {/* FECHAS */}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-tuki-cream">
                Fecha y hora de inicio
              </label>

              <input
                type="datetime-local"
                value={form.fechaInicio}
                onChange={(e) =>
                  handleChange(
                    "fechaInicio",
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-tuki-night px-4 py-3 text-tuki-cream outline-none transition focus:border-tuki-lime"
              />

              <p className="mt-2 text-xs text-tuki-cream/40">
                Opcional. Si no la completás, empieza
                cuando lo actives.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-tuki-cream">
                Fecha y hora de finalización
              </label>

              <input
                type="datetime-local"
                value={form.fechaFin}
                onChange={(e) =>
                  handleChange(
                    "fechaFin",
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-tuki-night px-4 py-3 text-tuki-cream outline-none transition focus:border-tuki-lime"
              />

              <p className="mt-2 text-xs text-tuki-cream/40">
                Opcional. Si no la completás, no tendrá
                vencimiento automático.
              </p>
            </div>
          </div>

          {/* BOTÓN */}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-tuki-lime px-6 py-3 font-bold text-tuki-night transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : editingId
                ? "Guardar cambios"
                : "Crear Happy Hour"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-white/10 px-6 py-3 font-bold text-tuki-cream transition hover:bg-white/5"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ==================================================
          LISTADO
      ================================================== */}

      <div className="mt-10">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-tuki-cream">
            Happy Hours creados
          </h2>

          <p className="mt-1 text-sm text-tuki-cream/50">
            Solo uno puede estar activo al mismo tiempo.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-tuki-night-soft p-8 text-center text-tuki-cream/50">
            Cargando Happy Hours...
          </div>
        ) : happyHours.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-tuki-night-soft p-10 text-center">
            <p className="text-lg font-bold text-tuki-cream">
              Todavía no hay Happy Hours.
            </p>

            <p className="mt-2 text-sm text-tuki-cream/50">
              Creá el primero utilizando el formulario de
              arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {happyHours.map((happyHour) => (
              <div
                key={happyHour.id}
                className="rounded-3xl bg-tuki-night-soft p-6 shadow-lg"
              >
                {/* CABECERA */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-tuki-cream sm:text-2xl">
                        {happyHour.titulo}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          happyHour.activo
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {happyHour.activo
                          ? "● ACTIVO"
                          : "● INACTIVO"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-tuki-cream/60">
                      {happyHour.descripcion}
                    </p>

                    {textoHappyHour(happyHour) && (
                      <p className="mt-1 text-xs text-tuki-lime/80">
                        Se muestra: {textoHappyHour(happyHour)}
                      </p>
                    )}
                  </div>

                  {/* ACCIONES */}

                  <div className="flex flex-wrap gap-2">
                    {!happyHour.activo && (
                      <button
                        onClick={() =>
                          activar(happyHour.id)
                        }
                        disabled={
                          actionLoading === happyHour.id
                        }
                        className="rounded-xl bg-tuki-lime px-4 py-2 text-sm font-bold text-tuki-night transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading ===
                        happyHour.id
                          ? "Activando..."
                          : "Activar"}
                      </button>
                    )}

                    {happyHour.activo && (
                      <button
                        onClick={desactivarTodos}
                        disabled={
                          actionLoading === "all"
                        }
                        className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Desactivar
                      </button>
                    )}

                    <button
                      onClick={() =>
                        editarHappyHour(happyHour)
                      }
                      disabled={
                        actionLoading === happyHour.id
                      }
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-tuki-cream transition hover:bg-white/5 disabled:opacity-50"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        eliminar(happyHour.id)
                      }
                      disabled={
                        actionLoading === happyHour.id
                      }
                      className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* INFORMACIÓN */}

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-tuki-night p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                      Tipo
                    </p>

                    <p className="mt-1 text-sm font-bold text-tuki-cream">
                      {obtenerLabelTipo(
                        happyHour.tipo
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-tuki-night p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                      Valor
                    </p>

                    <p className="mt-1 text-sm font-bold text-tuki-cream">
                      {happyHour.valor !== null &&
                      happyHour.valor !== undefined
                        ? `${happyHour.valor}%`
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-tuki-night p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                      Inicio
                    </p>

                    <p className="mt-1 text-sm font-bold text-tuki-cream">
                      {formatearFecha(
                        happyHour.fechaInicio
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-tuki-night p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                      Fin
                    </p>

                    <p className="mt-1 text-sm font-bold text-tuki-cream">
                      {formatearFecha(
                        happyHour.fechaFin
                      )}
                    </p>
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