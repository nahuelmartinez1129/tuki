"use client";

import {
  useEffect,
  useState,
} from "react";




export default function ProductosPage() {
  const [productos, setProductos] =
    useState<any[]>([]);

    const [showForm, setShowForm] =
  useState(false);

  const [editingId, setEditingId] =
  useState<string | null>(
    null
  );

const [form, setForm] =
  useState<{
    name: string;
    description: string;
    price: number;
    compareAtPrice: number;
    image: string;
    category: string;
    stock: number;
    tags: string[];
    activo: boolean;
    isCombo: boolean;
    orden: number;
  }>({
    name: "",
    description: "",
    price: 0,
    compareAtPrice: 0,
    image: "",
    category: "chocolates",
    stock: 0,
    tags: [],
    activo: true,
    isCombo: false,
    orden: 0,
  });

  async function load() {
    const response =
      await fetch(
        "/api/productos"
      );
console.log("STATUS:", response.status);
    const data =
      await response.json();
      console.log("DATA:", data);

    setProductos(data);
  }
  console.log("ESTADO:", productos);

  useEffect(() => {
    load();
  }, []);

  async function guardar() {
  await fetch(
  editingId
    ? "/api/productos/update"
    : "/api/productos",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        {
          ...form,
          id: editingId,
        }
      ),
    }
  );

  setShowForm(false);

  setForm({
    name: "",
    description: "",
    price: 0,
    compareAtPrice: 0,
    image: "",
    category: "chocolates",
    stock: 0,
    tags: [],
    activo: true,
    isCombo: false,
    orden: 0,
  });

  load();
  setEditingId(null);
}

function editar(producto: any) {
  console.log(producto);

  setForm({
    name: producto.name,
    description: producto.description,
    price: producto.price,
    compareAtPrice: producto.compareAtPrice ?? 0,
    image: producto.image,
    category: producto.category,
    stock: producto.stock,
    tags: producto.tags ?? [],
    activo: producto.activo,
    isCombo: producto.isCombo,
    orden: producto.orden,
  });

  setEditingId(producto.id);
  setShowForm(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
async function eliminar(
  id: string
) {
  await fetch(
    "/api/productos/delete",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        id,
      }),
    }
  );

  load();
}
  return (
    <>
      <h1 className="text-5xl font-bold text-tuki-cream">
        Productos
      </h1>

      <div className="mt-8">
 <button
  onClick={() =>
    setShowForm(true)
  }
  className="
    rounded-2xl
    bg-tuki-lime
    px-5
    py-3
    font-bold
    text-black
  "
>
  + Agregar producto
</button>
</div>

{showForm && (
  <div
    className="
      mt-6
      max-w-2xl
      rounded-3xl
      bg-tuki-night-soft
      p-8
      space-y-4
    "
  >
  <div>
    <label className="mb-2 block text-tuki-cream">
      Nombre
    </label>

    <input
      value={form.name}
      onChange={(e) =>
        setForm({
          ...form,
          name: e.target.value,
        })
      }
      className="
        w-full
        rounded-2xl
        bg-tuki-night
        p-4
        text-tuki-cream
        outline-none
        border
        border-white/10
      "
    />
  </div>

  <div>
    <label className="mb-2 block text-tuki-cream">
      Descripción
    </label>

    <textarea
      value={form.description}
      onChange={(e) =>
        setForm({
          ...form,
          description:
            e.target.value,
        })
      }
      className="
        w-full
        rounded-2xl
        bg-tuki-night
        p-4
        text-tuki-cream
        outline-none
        border
        border-white/10
      "
    />
  </div>

  <div>
    <label className="mb-2 block text-tuki-cream">
      Precio
    </label>

    <input
      type="number"
      value={form.price}
      onChange={(e) =>
        setForm({
          ...form,
          price: Number(
            e.target.value
          ),
        })
      }
      className="
        w-full
        rounded-2xl
        bg-tuki-night
        p-4
        text-tuki-cream
        outline-none
        border
        border-white/10
      "
    />
  </div>
  <div>
  <label className="mb-2 block text-tuki-cream">
    Precio anterior (opcional)
  </label>

  <input
    type="number"
    value={form.compareAtPrice}
    onChange={(e) =>
      setForm({
        ...form,
        compareAtPrice: Number(
          e.target.value
        ),
      })
    }
    className="
      w-full
      rounded-2xl
      bg-tuki-night
      p-4
      text-tuki-cream
      outline-none
      border
      border-white/10
    "
  />
</div>

  <div>
    <label className="mb-2 block text-tuki-cream">
      Stock
    </label>

    <input
      type="number"
      value={form.stock}
      onChange={(e) =>
        setForm({
          ...form,
          stock: Number(
            e.target.value
          ),
        })
      }
      className="
        w-full
        rounded-2xl
        bg-tuki-night
        p-4
        text-tuki-cream
        outline-none
        border
        border-white/10
      "
    />
  </div>

  <div>
    <label className="mb-2 block text-tuki-cream">
      Categoría
    </label>

    <select
      value={form.category}
      onChange={(e) =>
        setForm({
          ...form,
          category:
            e.target.value,
        })
      }
      className="
        w-full
        rounded-2xl
        bg-tuki-night
        p-4
        text-tuki-cream
        border
        border-white/10
      "
    >
      <option value="alfajores">
        Alfajores
      </option>

      <option value="chocolates">
        Chocolates
      </option>

      <option value="galletitas">
        Galletitas
      </option>

      <option value="gomitas">
        Gomitas
      </option>

      <option value="papas">
        Papas
      </option>

      <option value="gaseosas">
        Gaseosas
      </option>

      <option value="combos">
        Combos
      </option>

      <option value="misterioso">
  Caja Misteriosa
</option>
    </select>
  </div>

  <div>
    <label className="mb-2 block text-tuki-cream">
      Imagen
    </label>

    <input
      value={form.image}
      placeholder="/productos/tita.png"
      onChange={(e) =>
        setForm({
          ...form,
          image:
            e.target.value,
        })
      }
      className="
        w-full
        rounded-2xl
        bg-tuki-night
        p-4
        text-tuki-cream
        border
        border-white/10
      "
    />
  </div>

  <div>
  <label className="mb-2 block text-tuki-cream">
    Tags (separados por coma)
  </label>

  <input
    value={(form.tags ?? []).join(",")}
    placeholder="nuevo,top-ventas"
    onChange={(e) =>
      setForm({
        ...form,
        tags: e.target.value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      })
    }
    className="
      w-full
      rounded-2xl
      bg-tuki-night
      p-4
      text-tuki-cream
      border
      border-white/10
    "
  />
</div>

  <div className="flex gap-6">
    <label className="flex items-center gap-2 text-tuki-cream">
      <input
        type="checkbox"
        checked={form.activo}
        onChange={(e) =>
          setForm({
            ...form,
            activo:
              e.target.checked,
          })
        }
      />

      Activo
    </label>

    <label className="flex items-center gap-2 text-tuki-cream">
      <input
        type="checkbox"
        checked={form.isCombo}
        onChange={(e) =>
          setForm({
            ...form,
            isCombo:
              e.target.checked,
          })
        }
      />

      Es Combo
    </label>
  </div>

  <button
    onClick={guardar}
    className="
      w-full
      rounded-2xl
      bg-tuki-lime
      py-4
      font-bold
      text-black
    "
  >
    {editingId
      ? "Actualizar producto"
      : "Guardar producto"}
  </button>

  <button
  onClick={() => {
    setShowForm(false);

    setEditingId(null);

    setForm({
      name: "",
      description: "",
      price: 0,
      compareAtPrice: 0,
      image: "",
      category: "chocolates",
      stock: 0,
      tags: [],
      activo: true,
      isCombo: false,
      orden: 0,
    });
  }}
  className="
    mt-3
    w-full
    rounded-2xl
    border
    border-white/10
    py-4
    font-bold
    text-tuki-cream
  "
>
  Cancelar
</button>
</div>
)}
      <div className="mt-10 space-y-4">
        {productos.map((p) => (
          <div
            key={p.id}
            className="
              rounded-3xl
              bg-tuki-night-soft
              p-6
            "
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-bold text-tuki-cream">
                  {p.name}
                </h2>

                <p className="text-tuki-cream/60">
                  {p.description}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-tuki-lime">
                  ${p.price}
                </p>


  <p className="text-sm text-tuki-cream/60">
    Antes:
    {p.compareAtPrice
      ? ` $${p.compareAtPrice}`
      : " -"}
  </p>

                <p className="text-sm text-tuki-cream/60">
                  Stock: {p.stock}
                </p>

                <p className="text-sm text-tuki-cream/60">
  Categoría: {p.category}
</p>

<p
  className={`text-sm ${
    p.activo
      ? "text-green-400"
      : "text-red-400"
  }`}
>
  {p.activo
    ? "● Activo"
    : "● Inactivo"}
</p>
<p className="text-sm text-purple-400">
  {p.isCombo
    ? "🎁 Combo"
    : "Producto individual"}
</p>

<p className="text-sm text-tuki-cream/60">
  Tags:
  {p.tags.length
    ? ` ${p.tags.join(", ")}`
    : " -"}
</p>

                <p className="text-sm text-tuki-cream/60">
  Tags:
  {p.tags.length > 0
    ? ` ${p.tags.join(", ")}`
    : " -"}
</p>

                <div className="mt-4 flex gap-2">
  <button
  onClick={() =>
    editar(p)
  }
  className="
    rounded-xl
    bg-blue-500
    px-4
    py-2
    text-white
  "
>
  Editar
</button>

  <button
  onClick={() =>
    eliminar(p.id)
  }
  className="
    rounded-xl
    bg-red-500
    px-4
    py-2
    text-white
  "
>
  Eliminar
</button>
</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}