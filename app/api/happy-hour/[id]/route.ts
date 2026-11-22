import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

// ======================================================
// PATCH
// Editar un Happy Hour existente
// ======================================================

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const { id } = await context.params;

    const body = await request.json();

    const {
      titulo,
      descripcion,
      tipo,
      valor,
      fechaInicio,
      fechaFin,
    } = body;

    // --------------------------------------------------
    // VERIFICAR QUE EXISTA
    // --------------------------------------------------

    const existente = await prisma.happyHour.findUnique({
      where: {
        id,
      },
    });

    if (!existente) {
      return NextResponse.json(
        {
          error: "El Happy Hour no existe.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // VALIDACIONES
    // --------------------------------------------------

    if (
      typeof titulo !== "string" ||
      !titulo.trim()
    ) {
      return NextResponse.json(
        {
          error: "El título es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof descripcion !== "string" ||
      !descripcion.trim()
    ) {
      return NextResponse.json(
        {
          error: "La descripción es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof tipo !== "string" ||
      !tipo.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "El tipo de promoción es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // TIPOS PERMITIDOS
    // --------------------------------------------------

    const tiposPermitidos = [
      "ENVIO_GRATIS",
      "DESCUENTO",
      "CAJA_10",
      "GOMITAS",
      "GUAYMALLEN",
    ];

    if (!tiposPermitidos.includes(tipo)) {
      return NextResponse.json(
        {
          error:
            "El tipo de promoción no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // VALOR
    // --------------------------------------------------

    let valorFinal: number | null = null;

    const tiposQueRequierenValor = [
      "DESCUENTO",
      "CAJA_10",
    ];

    if (tiposQueRequierenValor.includes(tipo)) {
      const numero = Number(valor);

      if (
        Number.isNaN(numero) ||
        numero <= 0 ||
        numero > 10
      ) {
        return NextResponse.json(
          {
            error:
              "El porcentaje debe estar entre 1 y 10.",
          },
          {
            status: 400,
          }
        );
      }

      valorFinal = numero;
    }

    // --------------------------------------------------
    // FECHAS
    // --------------------------------------------------

    let fechaInicioFinal: Date | null = null;
    let fechaFinFinal: Date | null = null;

    if (fechaInicio) {
      const fecha = new Date(fechaInicio);

      if (Number.isNaN(fecha.getTime())) {
        return NextResponse.json(
          {
            error:
              "La fecha de inicio no es válida.",
          },
          {
            status: 400,
          }
        );
      }

      fechaInicioFinal = fecha;
    }

    if (fechaFin) {
      const fecha = new Date(fechaFin);

      if (Number.isNaN(fecha.getTime())) {
        return NextResponse.json(
          {
            error:
              "La fecha de finalización no es válida.",
          },
          {
            status: 400,
          }
        );
      }

      fechaFinFinal = fecha;
    }

    // --------------------------------------------------
    // VALIDAR ORDEN DE FECHAS
    // --------------------------------------------------

    if (
      fechaInicioFinal &&
      fechaFinFinal &&
      fechaFinFinal <= fechaInicioFinal
    ) {
      return NextResponse.json(
        {
          error:
            "La fecha de finalización debe ser posterior a la fecha de inicio.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // ACTUALIZAR
    //
    // IMPORTANTE:
    // No modificamos "activo".
    //
    // Si estaba activo, sigue activo.
    // Si estaba inactivo, sigue inactivo.
    // --------------------------------------------------

    const happyHour = await prisma.happyHour.update({
      where: {
        id,
      },
      data: {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        valor: valorFinal,
        fechaInicio: fechaInicioFinal,
        fechaFin: fechaFinFinal,
      },
    });

    return NextResponse.json(happyHour);
  } catch (error) {
    console.error(
      "ERROR PATCH /api/happy-hour/[id]:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo actualizar el Happy Hour.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// DELETE
// Eliminar un Happy Hour
// ======================================================

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const { id } = await context.params;

    // --------------------------------------------------
    // VERIFICAR QUE EXISTA
    // --------------------------------------------------

    const existente = await prisma.happyHour.findUnique({
      where: {
        id,
      },
    });

    if (!existente) {
      return NextResponse.json(
        {
          error: "El Happy Hour no existe.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // ELIMINAR
    // --------------------------------------------------

    await prisma.happyHour.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Happy Hour eliminado correctamente.",
    });
  } catch (error) {
    console.error(
      "ERROR DELETE /api/happy-hour/[id]:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo eliminar el Happy Hour.",
      },
      {
        status: 500,
      }
    );
  }
}