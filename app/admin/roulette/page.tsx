"use client";

import { useEffect, useState } from "react";

type Premio = {
  id: string;
  nombre: string;
  tipo: string;
  valor: number | null;
  probabilidad: number;
  activo: boolean;
};

type NuevoPremio = {
  nombre: string;
  tipo: string;
  valor: string;
  probabilidad: string;
  activo: boolean;
};

export default function RouletteAdminPage() {
  const [premios, setPremios] = useState<Premio[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [nuevoPremio, setNuevoPremio] =
    useState<NuevoPremio>({
      nombre: "",
      tipo: "",
      valor: "",
      probabilidad: "10",
      activo: true,
    });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // CARGAR PREMIOS
  // ======================================================

  async function cargarPremios() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/roulette",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudieron cargar los premios."
        );
      }

      setPremios(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los premios."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarPremios();
  }, []);

  // ======================================================
  // MENSAJES
  // ======================================================

  function mostrarSuccess(mensaje: string) {
    setSuccess(mensaje);
    setError("");

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  function mostrarError(mensaje: string) {
    setError(mensaje);
    setSuccess("");
  }

  // ======================================================
  // CREAR PREMIO
  // ======================================================

  async function crearPremio() {
    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const nombre = nuevoPremio.nombre.trim();
      const tipo = nuevoPremio.tipo.trim();

      if (!nombre) {
        throw new Error(
          "El nombre del premio no puede estar vacío."
        );
      }

      if (!tipo) {
        throw new Error(
          "El tipo del premio no puede estar vacío."
        );
      }

      const probabilidad = Number(
        nuevoPremio.probabilidad
      );

      if (
        Number.isNaN(probabilidad) ||
        probabilidad < 0 ||
        probabilidad > 100
      ) {
        throw new Error(
          "La probabilidad debe estar entre 0 y 100."
        );
      }

      let valor: number | null = null;

      if (nuevoPremio.valor.trim() !== "") {
        valor = Number(nuevoPremio.valor);

        if (Number.isNaN(valor)) {
          throw new Error(
            "El valor debe ser un número válido."
          );
        }
      }

      const response = await fetch(
        "/api/admin/roulette",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            tipo,
            valor,
            probabilidad,
            activo: nuevoPremio.activo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo crear el premio."
        );
      }

      // Agregamos el nuevo premio a la lista
      setPremios((actuales) => [
        ...actuales,
        data,
      ]);

      // Limpiamos formulario
      setNuevoPremio({
        nombre: "",
        tipo: "",
        valor: "",
        probabilidad: "10",
        activo: true,
      });

      setMostrarFormulario(false);

      mostrarSuccess(
        "Premio creado correctamente."
      );
    } catch (error) {
      console.error(error);

      mostrarError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el premio."
      );
    } finally {
      setCreating(false);
    }
  }

  // ======================================================
  // ACTUALIZAR CAMPO LOCAL
  // ======================================================

  function actualizarPremio(
    id: string,
    campo: keyof Premio,
    valor:
      | string
      | number
      | boolean
      | null
  ) {
    setPremios((actuales) =>
      actuales.map((premio) =>
        premio.id === id
          ? {
              ...premio,
              [campo]: valor,
            }
          : premio
      )
    );
  }

  // ======================================================
  // GUARDAR PREMIO
  // ======================================================

  async function guardarPremio(
    premio: Premio
  ) {
    try {
      setSavingId(premio.id);
      setError("");
      setSuccess("");

      const probabilidad = Number(
        premio.probabilidad
      );

      if (
        Number.isNaN(probabilidad) ||
        probabilidad < 0 ||
        probabilidad > 100
      ) {
        throw new Error(
          "La probabilidad debe estar entre 0 y 100."
        );
      }

      if (!premio.nombre.trim()) {
        throw new Error(
          "El nombre del premio no puede estar vacío."
        );
      }

      if (!premio.tipo.trim()) {
        throw new Error(
          "El tipo del premio no puede estar vacío."
        );
      }

      const response = await fetch(
        "/api/admin/roulette",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: premio.id,
            nombre: premio.nombre,
            tipo: premio.tipo,
            valor: premio.valor,
            probabilidad,
            activo: premio.activo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo guardar el premio."
        );
      }

      setPremios((actuales) =>
        actuales.map((item) =>
          item.id === premio.id
            ? data
            : item
        )
      );

      mostrarSuccess(
        "Premio actualizado correctamente."
      );
    } catch (error) {
      console.error(error);

      mostrarError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el premio."
      );
    } finally {
      setSavingId(null);
    }
  }

  // ======================================================
  // ACTIVAR / DESACTIVAR
  // ======================================================

  async function cambiarEstado(
    premio: Premio
  ) {
    try {
      setSavingId(premio.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/roulette",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: premio.id,
            activo: !premio.activo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo cambiar el estado."
        );
      }

      setPremios((actuales) =>
        actuales.map((item) =>
          item.id === premio.id
            ? data
            : item
        )
      );

      mostrarSuccess(
        data.activo
          ? "Premio activado."
          : "Premio desactivado."
      );
    } catch (error) {
      console.error(error);

      mostrarError(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado."
      );
    } finally {
      setSavingId(null);
    }
  }

  // ======================================================
  // ELIMINAR
  // ======================================================

  async function eliminarPremio(
    premio: Premio
  ) {
    const confirmar =
      window.confirm(
        `¿Seguro que querés eliminar "${premio.nombre}"? Esta acción no se puede deshacer.`
      );

    if (!confirmar) {
      return;
    }

    try {
      setDeletingId(premio.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/roulette?id=${encodeURIComponent(
          premio.id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "No se pudo eliminar el premio."
        );
      }

      setPremios((actuales) =>
        actuales.filter(
          (item) =>
            item.id !== premio.id
        )
      );

      mostrarSuccess(
        "Premio eliminado correctamente."
      );
    } catch (error) {
      console.error(error);

      mostrarError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el premio."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ======================================================
  // CALCULAR TOTAL DE PROBABILIDADES
  // ======================================================

  const premiosActivos =
    premios.filter(
      (premio) => premio.activo
    );

  const totalProbabilidad =
    premiosActivos.reduce(
      (total, premio) =>
        total +
        Number(
          premio.probabilidad || 0
        ),
      0
    );

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="pb-10">

      {/* ==================================================
          ENCABEZADO
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tuki-cream sm:text-4xl lg:text-5xl">
            Ruleta TUKI
          </h1>

          <p className="mt-2 text-sm text-tuki-cream/60">
            Administrá los premios y sus probabilidades.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() =>
              setMostrarFormulario(
                !mostrarFormulario
              )
            }
            className="rounded-2xl bg-tuki-lime px-5 py-3 font-bold text-tuki-night transition hover:opacity-90"
          >
            {mostrarFormulario
              ? "Cerrar formulario"
              : "+ Nuevo premio"}
          </button>

          <button
            type="button"
            onClick={cargarPremios}
            disabled={loading}
            className="rounded-2xl border border-white/10 px-5 py-3 font-bold text-tuki-cream transition hover:bg-white/5 disabled:opacity-50"
          >
            {loading
              ? "Cargando..."
              : "Actualizar"}
          </button>

        </div>
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
          FORMULARIO NUEVO PREMIO
      ================================================== */}

      {mostrarFormulario && (
        <div className="mt-8 rounded-3xl border border-tuki-lime/20 bg-tuki-night-soft p-6 shadow-lg">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-tuki-cream">
              Crear nuevo premio
            </h2>

            <p className="mt-2 text-sm text-tuki-cream/50">
              Este premio se guardará directamente en la base
              de datos y podrá participar de la ruleta.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* NOMBRE */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                Nombre del premio
              </label>

              <input
                type="text"
                value={nuevoPremio.nombre}
                onChange={(e) =>
                  setNuevoPremio(
                    (actual) => ({
                      ...actual,
                      nombre:
                        e.target.value,
                    })
                  )
                }
                placeholder="Ej: Alfajor gratis"
                className="w-full rounded-xl border border-white/10 bg-tuki-night px-4 py-3 text-sm text-tuki-cream outline-none transition focus:border-tuki-lime"
              />
            </div>

            {/* TIPO */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                Tipo
              </label>

              <input
                type="text"
                value={nuevoPremio.tipo}
                onChange={(e) =>
                  setNuevoPremio(
                    (actual) => ({
                      ...actual,
                      tipo:
                        e.target.value,
                    })
                  )
                }
                placeholder="Ej: ALFAJOR"
                className="w-full rounded-xl border border-white/10 bg-tuki-night px-4 py-3 text-sm text-tuki-cream outline-none transition focus:border-tuki-lime"
              />

              <p className="mt-2 text-xs text-tuki-cream/40">
                Usá un identificador en mayúsculas,
                por ejemplo: ALFAJOR, GOMITAS,
                DESCUENTO o ENVIO_GRATIS.
              </p>
            </div>

            {/* VALOR */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                Valor
              </label>

              <input
                type="number"
                value={nuevoPremio.valor}
                onChange={(e) =>
                  setNuevoPremio(
                    (actual) => ({
                      ...actual,
                      valor:
                        e.target.value,
                    })
                  )
                }
                placeholder="Opcional"
                className="w-full rounded-xl border border-white/10 bg-tuki-night px-4 py-3 text-sm text-tuki-cream outline-none transition focus:border-tuki-lime"
              />

              <p className="mt-2 text-xs text-tuki-cream/40">
                Por ejemplo, para un descuento
                podés usar 10.
              </p>
            </div>

            {/* PROBABILIDAD */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                Probabilidad / peso
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    nuevoPremio.probabilidad
                  }
                  onChange={(e) =>
                    setNuevoPremio(
                      (actual) => ({
                        ...actual,
                        probabilidad:
                          e.target.value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-tuki-night px-4 py-3 pr-10 text-sm font-bold text-tuki-cream outline-none transition focus:border-tuki-lime"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-tuki-cream/40">
                  %
                </span>
              </div>
            </div>

          </div>

          {/* ACTIVO */}

          <div className="mt-5 rounded-2xl bg-tuki-night p-5">
            <label className="flex cursor-pointer items-center gap-3">

              <input
                type="checkbox"
                checked={
                  nuevoPremio.activo
                }
                onChange={(e) =>
                  setNuevoPremio(
                    (actual) => ({
                      ...actual,
                      activo:
                        e.target.checked,
                    })
                  )
                }
                className="h-5 w-5 accent-tuki-lime"
              />

              <div>
                <p className="font-bold text-tuki-cream">
                  Premio activo
                </p>

                <p className="mt-1 text-xs text-tuki-cream/40">
                  Si está activo, podrá salir en
                  la ruleta.
                </p>
              </div>

            </label>
          </div>

          {/* BOTONES */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={crearPremio}
              disabled={creating}
              className="rounded-xl bg-tuki-lime px-6 py-3 font-bold text-tuki-night transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating
                ? "Creando..."
                : "Crear premio"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMostrarFormulario(
                  false
                );

                setNuevoPremio({
                  nombre: "",
                  tipo: "",
                  valor: "",
                  probabilidad: "10",
                  activo: true,
                });
              }}
              disabled={creating}
              className="rounded-xl border border-white/10 px-6 py-3 font-bold text-tuki-cream transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>

          </div>

        </div>
      )}

      {/* ==================================================
          RESUMEN
      ================================================== */}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">

        <div className="rounded-3xl bg-tuki-night-soft p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
            Premios
          </p>

          <p className="mt-2 text-3xl font-extrabold text-tuki-cream">
            {premios.length}
          </p>
        </div>

        <div className="rounded-3xl bg-tuki-night-soft p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
            Premios activos
          </p>

          <p className="mt-2 text-3xl font-extrabold text-tuki-lime">
            {premiosActivos.length}
          </p>
        </div>

        <div className="rounded-3xl bg-tuki-night-soft p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
            Probabilidad total
          </p>

          <p
            className={`mt-2 text-3xl font-extrabold ${
              totalProbabilidad === 100
                ? "text-green-400"
                : "text-tuki-yellow"
            }`}
          >
            {totalProbabilidad}%
          </p>

          <p className="mt-1 text-xs text-tuki-cream/40">
            No es obligatorio que sume 100.
          </p>
        </div>

      </div>

      {/* ==================================================
          INFORMACIÓN
      ================================================== */}

      <div className="mt-6 rounded-3xl border border-tuki-lime/20 bg-tuki-lime/5 p-5">

        <p className="font-bold text-tuki-lime">
          🎯 ¿Cómo funciona la probabilidad?
        </p>

        <p className="mt-2 text-sm leading-6 text-tuki-cream/70">
          Los valores funcionan como pesos. Por ejemplo,
          si un premio tiene 50 y otro tiene 10, el primero
          tendrá cinco veces más posibilidades de salir.
          Los premios inactivos no participan.
        </p>

      </div>

      {/* ==================================================
          LISTADO
      ================================================== */}

      <div className="mt-10">

        <h2 className="mb-5 text-2xl font-bold text-tuki-cream">
          Premios de la ruleta
        </h2>

        {loading ? (
          <div className="rounded-3xl bg-tuki-night-soft p-10 text-center text-tuki-cream/50">
            Cargando premios...
          </div>
        ) : premios.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-tuki-night-soft p-10 text-center">

            <p className="text-lg font-bold text-tuki-cream">
              No hay premios cargados.
            </p>

            <p className="mt-2 text-sm text-tuki-cream/50">
              Usá el botón &quot;+ Nuevo premio&quot;
              para crear el primero.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {premios.map((premio) => (

              <div
                key={premio.id}
                className="rounded-3xl bg-tuki-night-soft p-6 shadow-lg"
              >

                {/* CABECERA */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h3 className="text-xl font-bold text-tuki-cream sm:text-2xl">
                        {premio.nombre}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          premio.activo
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {premio.activo
                          ? "● ACTIVO"
                          : "● INACTIVO"}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-tuki-cream/50">
                      Tipo:{" "}
                      <span className="font-semibold text-tuki-cream/80">
                        {premio.tipo}
                      </span>
                    </p>

                  </div>

                  {/* ESTADO */}

                  <button
                    type="button"
                    onClick={() =>
                      cambiarEstado(
                        premio
                      )
                    }
                    disabled={
                      savingId ===
                        premio.id ||
                      deletingId ===
                        premio.id
                    }
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      premio.activo
                        ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : "bg-tuki-lime text-tuki-night hover:opacity-90"
                    }`}
                  >
                    {savingId ===
                    premio.id
                      ? "Guardando..."
                      : premio.activo
                      ? "Desactivar"
                      : "Activar"}
                  </button>

                </div>

                {/* CAMPOS */}

                <div className="mt-6 grid gap-5 md:grid-cols-3">

                  {/* NOMBRE */}

                  <div>

                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                      Nombre
                    </label>

                    <input
                      type="text"
                      value={
                        premio.nombre
                      }
                      onChange={(e) =>
                        actualizarPremio(
                          premio.id,
                          "nombre",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-tuki-night px-4 py-3 text-sm text-tuki-cream outline-none transition focus:border-tuki-lime"
                    />

                  </div>

                  {/* TIPO */}

                  <div>

                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                      Tipo
                    </label>

                    <input
                      type="text"
                      value={
                        premio.tipo
                      }
                      onChange={(e) =>
                        actualizarPremio(
                          premio.id,
                          "tipo",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-tuki-night px-4 py-3 text-sm text-tuki-cream outline-none transition focus:border-tuki-lime"
                    />

                  </div>

                  {/* VALOR */}

                  <div>

                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-tuki-cream/40">
                      Valor
                    </label>

                    <input
                      type="number"
                      value={
                        premio.valor ??
                        ""
                      }
                      onChange={(e) =>
                        actualizarPremio(
                          premio.id,
                          "valor",
                          e.target.value ===
                            ""
                            ? null
                            : Number(
                                e.target.value
                              )
                        )
                      }
                      placeholder="Sin valor"
                      className="w-full rounded-xl border border-white/10 bg-tuki-night px-4 py-3 text-sm text-tuki-cream outline-none transition focus:border-tuki-lime"
                    />

                  </div>

                </div>

                {/* PROBABILIDAD */}

                <div className="mt-5 rounded-2xl bg-tuki-night p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="font-bold text-tuki-cream">
                        Probabilidad
                      </p>

                      <p className="mt-1 text-xs text-tuki-cream/40">
                        Peso utilizado por el backend al
                        seleccionar el premio.
                      </p>

                    </div>

                    <div className="relative w-full sm:w-40">

                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          premio.probabilidad
                        }
                        onChange={(e) =>
                          actualizarPremio(
                            premio.id,
                            "probabilidad",
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-tuki-night-soft px-4 py-3 pr-10 text-right font-bold text-tuki-cream outline-none transition focus:border-tuki-lime"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-tuki-cream/40">
                        %
                      </span>

                    </div>

                  </div>

                </div>

                {/* ACCIONES */}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={() =>
                      guardarPremio(
                        premio
                      )
                    }
                    disabled={
                      savingId ===
                        premio.id ||
                      deletingId ===
                        premio.id
                    }
                    className="rounded-xl bg-tuki-lime px-5 py-3 font-bold text-tuki-night transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingId ===
                    premio.id
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      eliminarPremio(
                        premio
                      )
                    }
                    disabled={
                      savingId ===
                        premio.id ||
                      deletingId ===
                        premio.id
                    }
                    className="rounded-xl border border-red-500/30 px-5 py-3 font-bold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId ===
                    premio.id
                      ? "Eliminando..."
                      : "Eliminar premio"}
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}