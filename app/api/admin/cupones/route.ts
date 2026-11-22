import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ======================================================
// GET
// Lista todos los cupones
// ======================================================

export async function GET() {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  const cupones = await prisma.cupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(cupones);
}

// ======================================================
// POST
// Crea un cupón
// ======================================================

export async function POST(request: Request) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const body = await request.json();

    const codigo = String(body.codigo ?? "")
      .trim()
      .toUpperCase();

    const tipo = body.tipo;
    const valor = Number(body.valor);
    const maxUsos = Number(body.maxUsos);
    const compraMinima = Number(body.compraMinima ?? 0);
    const topeDescuento =
      body.topeDescuento === "" ||
      body.topeDescuento === null ||
      body.topeDescuento === undefined
        ? null
        : Number(body.topeDescuento);

    if (!/^[A-Z0-9_-]{3,20}$/.test(codigo)) {
      return NextResponse.json(
        {
          error:
            "El código debe tener entre 3 y 20 letras o números.",
        },
        { status: 400 }
      );
    }

    if (!["FIJO", "PORCENTAJE"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de cupón inválido." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(valor) ||
      valor <= 0 ||
      (tipo === "PORCENTAJE" && valor > 15)
    ) {
      return NextResponse.json(
        {
          error:
            "El valor debe ser mayor a 0 (y como máximo 15% si es porcentaje).",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(maxUsos) ||
      maxUsos <= 0 ||
      !Number.isInteger(compraMinima) ||
      compraMinima < 0 ||
      (topeDescuento !== null &&
        (!Number.isInteger(topeDescuento) ||
          topeDescuento <= 0))
    ) {
      return NextResponse.json(
        {
          error:
            "Revisá usos máximos, compra mínima y tope.",
        },
        { status: 400 }
      );
    }

    const existe = await prisma.cupon.findUnique({
      where: { codigo },
    });

    if (existe) {
      return NextResponse.json(
        { error: "Ya existe un cupón con ese código." },
        { status: 400 }
      );
    }

    const cupon = await prisma.cupon.create({
      data: {
        codigo,
        tipo,
        valor,
        maxUsos,
        compraMinima,
        topeDescuento,
      },
    });

    return NextResponse.json(cupon);
  } catch (error) {
    console.error("ERROR POST /api/admin/cupones:", error);

    return NextResponse.json(
      { error: "No se pudo crear el cupón." },
      { status: 500 }
    );
  }
}

// ======================================================
// PATCH
// Activa o desactiva un cupón
// ======================================================

export async function PATCH(request: Request) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const { id, activo } = await request.json();

    const cupon = await prisma.cupon.update({
      where: { id },
      data: { activo: Boolean(activo) },
    });

    return NextResponse.json(cupon);
  } catch (error) {
    console.error("ERROR PATCH /api/admin/cupones:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el cupón." },
      { status: 500 }
    );
  }
}
