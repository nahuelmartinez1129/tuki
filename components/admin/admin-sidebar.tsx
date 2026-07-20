"use client";


import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Gift,
  Clock3,
  Package,
  Users,
  Settings,
  Flame,
  Menu,
  X,
} from "lucide-react";

const items = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: ShoppingBag,
  },
  {
    href: "/admin/premios",
    label: "Premios",
    icon: Gift,
  },
  {
  href: "/admin/happy-hour",
  label: "Happy Hour",
  icon: Flame,
},
  {
    href: "/admin/horarios",
    label: "Horarios",
    icon: Clock3,
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: Package,
  },
  {
    href: "/admin/usuarios",
    label: "Usuarios",
    icon: Users,
  },
  {
    href: "/admin/configuracion",
    label: "Configuración",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const [open, setOpen] =
  useState(false);
  const [
  pendientes,
  setPendientes,
] = useState(0);

useEffect(() => {
  async function load() {
    const response =
      await fetch(
        "/api/pedidos/all"
      );

    const data =
      await response.json();

    const count =
      data.filter(
        (p: any) =>
          p.estado !==
            "ENTREGADO" &&
          p.estado !==
            "CANCELADO"
      ).length;

    setPendientes(count);
  }

  load();

  const interval =
    setInterval(load, 2000);

  return () =>
    clearInterval(interval);
}, []);
 return (
  <>
    {/* Fondo oscuro */}
    {open && (
      <div
        className="
          fixed
          inset-0
          z-30
          bg-black/60 backdrop-blur-sm
          lg:hidden
        "
        onClick={() =>
          setOpen(false)
        }
      />
    )}

    {/* Botón hamburguesa */}
    <button
      onClick={() =>
        setOpen(!open)
      }
      className="
        fixed
        left-4
        top-6
        z-50
        rounded-xl
        bg-tuki-night-soft
        p-3
        shadow-xl
        text-tuki-lime
        lg:hidden
      "
    >
      {open ? <X /> : <Menu />}
    </button>

    {/* Sidebar */}
    <aside
      className={`
        fixed
        left-0
        top-0
        z-40
        h-screen
        w-[280px]
sm:w-72
        border-r
        border-white/10
        bg-tuki-night-soft
        p-6
        transition-transform
        duration-300

        ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }

        lg:translate-x-0
        lg:static
      `}
    >
      <h1 className="
font-display
text-2xl
lg:text-3xl
font-extrabold
text-tuki-lime
">
  TUKI ADMIN
</h1>

      <div className="mt-8 space-y-2">
        {items.map((item) => {
          const Icon =
            item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                px-4
                py-3
                text-tuki-cream/70
                transition
                hover:bg-white/5
                hover:text-tuki-lime
              "
            >
              <Icon className="h-5 w-5" />

              <span>
                {item.label}
              </span>

              {item.href ===
                "/admin/pedidos" &&
                pendientes >
                  0 && (
                  <span
                    className="
                      ml-auto
                      rounded-full
                      bg-red-500
                      px-2
                      py-0.5
                      text-xs
                      font-bold
                      text-white
                    "
                  >
                    {
                      pendientes
                    }
                  </span>
                )}
            </Link>
          );
        })}
      </div>
    </aside>
  </>
);
}