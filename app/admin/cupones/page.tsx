"use client";

import { useEffect, useState } from "react";
import { REGLAS } from "@/lib/promociones";

type Cupon = {
  id: string;
  codigo: string;
  tipo: string;
  valor: number | null;
  maxUsos: number;
  usosActuales: number;
  compraMinima: number;
  topeDescuento: number | null;
  activo: boolean;
};

const FORM_INICIAL = {
  codigo: "",
  tipo: "FIJO",
  valor: "",
  maxUsos: "100",
  compraMinima: "7000",
  topeDescuento: "",
};

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-tuki-night p-4 text-tuki-cream outline-none";

function pesos(monto: number) {
  return `$${monto.toLocaleString("es-AR")}`;
}

export default function CuponesPage() {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function load() {
    const response = await fetch("/api/admin/cupones", {
      cache: "no-store",
    });

    if (response.ok) {
      setCupones(await response.json());
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function crear() {
    setError("");
    setGuardando(true);

    try {
      const response = await fetch("/api/admin/cupones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "No se pudo crear el cupón.");
        return;
      }

      setForm(FORM_INICIAL);
      load();
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(cupon: Cupon) {
    await fetch("/api/admin/cupones", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: cupon.id,
        activo: !cupon.activo,
      }),
    });

    load();
  }

  return (
    <>
      <h1 className="text-5xl font-bold text-tuki-cream">
        Cupones
      </h1>

      <p className="mt-3 max-w-2xl text-tuki-cream/60">
        Cada cliente puede usar un cupón una sola vez y no se
        combina con otras promociones. El descuento nunca supera
        el {REGLAS.descuentoMaxPorcentaje}% de los productos. El
        bono de bienvenida ({pesos(REGLAS.bienvenidaDescuento)} desde{" "}
        {pesos(REGLAS.bienvenidaMinimo)}) es automático y no
        necesita cupón.
      </p>

      <div className="mt-8 max-w-2xl space-y-4 rounded-3xl bg-tuki-night-soft p-8">
        <div>
          <label className="mb-2 block text-tuki-cream">
            Código
          </label>
          <input
            value={form.codigo}
            placeholder="TUKI500"
            onChange={(e) =>
              setForm({
                ...form,
                codigo: e.target.value.toUpperCase(),
              })
            }
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-tuki-cream">
              Tipo
            </label>
            <select
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value })
              }
              className={inputClass}
            >
              <option value="FIJO">Monto fijo ($)</option>
              <option value="PORCENTAJE">Porcentaje (%)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-tuki-cream">
              {form.tipo === "FIJO"
                ? "Descuento ($)"
                : "Descuento (%) · máx. 15"}
            </label>
            <input
              type="number"
              value={form.valor}
              onChange={(e) =>
                setForm({ ...form, valor: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-tuki-cream">
              Compra mínima ($)
            </label>
            <input
              type="number"
              value={form.compraMinima}
              onChange={(e) =>
                setForm({
                  ...form,
                  compraMinima: e.target.value,
                })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-tuki-cream">
              Tope de descuento ($, opcional)
            </label>
            <input
              type="number"
              value={form.topeDescuento}
              onChange={(e) =>
                setForm({
                  ...form,
                  topeDescuento: e.target.value,
                })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-tuki-cream">
              Usos máximos (en total)
            </label>
            <input
              type="number"
              value={form.maxUsos}
              onChange={(e) =>
                setForm({ ...form, maxUsos: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={crear}
          disabled={guardando}
          className="w-full rounded-2xl bg-tuki-lime py-4 font-bold text-black disabled:opacity-50"
        >
          Crear cupón
        </button>
      </div>

      <div className="mt-10 space-y-4">
        {cupones.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-tuki-night-soft p-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-tuki-cream">
                {c.codigo}
              </h2>

              <p className="text-tuki-cream/60">
                {c.tipo === "PORCENTAJE"
                  ? `${c.valor}% de descuento`
                  : `${pesos(c.valor ?? 0)} de descuento`}
                {c.topeDescuento
                  ? ` (tope ${pesos(c.topeDescuento)})`
                  : ""}
                {" · "}desde {pesos(c.compraMinima)}
              </p>

              <p className="text-sm text-tuki-cream/60">
                Usos: {c.usosActuales} / {c.maxUsos}
              </p>
            </div>

            <button
              onClick={() => cambiarEstado(c)}
              className={`rounded-xl px-4 py-2 font-bold ${
                c.activo
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {c.activo ? "● Activo" : "● Inactivo"}
            </button>
          </div>
        ))}

        {cupones.length === 0 && (
          <p className="text-tuki-cream/60">
            Todavía no hay cupones.
          </p>
        )}
      </div>
    </>
  );
}
