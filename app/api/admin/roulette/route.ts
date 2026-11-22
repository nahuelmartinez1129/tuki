import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ======================================================
// GET
// Obtener todos los premios de la Ruleta
// ======================================================

export async function GET() {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const premios = await prisma.premio.findMany({
      orderBy: [
        {
          activo: "desc",
        },
        {
          nombre: "asc",
        },
      ],
    });

    return NextResponse.json(premios);
  } catch (error) {
    console.error(
      "ERROR GET /api/admin/roulette:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudieron obtener los premios.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST
// Crear un nuevo premio
//
// Permite crear:
// - nombre
// - tipo
// - valor
// - probabilidad
// - activo
// ======================================================

export async function POST(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const body = await request.json();

    const {
      nombre,
      tipo,
      valor,
      probabilidad,
      activo,
    } = body;

    // --------------------------------------------------
    // NOMBRE
    // --------------------------------------------------

    if (
      typeof nombre !== "string" ||
      !nombre.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "El nombre del premio no puede estar vacío.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // TIPO
    // --------------------------------------------------

    if (
      typeof tipo !== "string" ||
      !tipo.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "El tipo del premio no puede estar vacío.",
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

    if (
      valor !== undefined &&
      valor !== null &&
      valor !== ""
    ) {
      const numeroValor = Number(valor);

      if (
        Number.isNaN(numeroValor)
      ) {
        return NextResponse.json(
          {
            error:
              "El valor debe ser numérico.",
          },
          {
            status: 400,
          }
        );
      }

      valorFinal = numeroValor;
    }

    // --------------------------------------------------
    // PROBABILIDAD
    // --------------------------------------------------

    const probabilidadFinal =
      Number(
        probabilidad ?? 10
      );

    if (
      Number.isNaN(
        probabilidadFinal
      ) ||
      probabilidadFinal < 0 ||
      probabilidadFinal > 100
    ) {
      return NextResponse.json(
        {
          error:
            "La probabilidad debe estar entre 0 y 100.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // ACTIVO
    // --------------------------------------------------

    let activoFinal = true;

    if (activo !== undefined) {
      if (
        typeof activo !== "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "El campo activo debe ser verdadero o falso.",
          },
          {
            status: 400,
          }
        );
      }

      activoFinal = activo;
    }

    // --------------------------------------------------
    // CREAR PREMIO
    // --------------------------------------------------

    const premio =
      await prisma.premio.create({
        data: {
          nombre: nombre.trim(),
          tipo: tipo.trim(),
          valor: valorFinal,
          probabilidad:
            probabilidadFinal,
          activo: activoFinal,
        },
      });

    return NextResponse.json(
      premio,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "ERROR POST /api/admin/roulette:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo crear el premio.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// PATCH
// Modificar un premio
//
// Permite modificar:
// - nombre
// - tipo
// - valor
// - probabilidad
// - activo
// ======================================================

export async function PATCH(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const body = await request.json();

    const {
      id,
      nombre,
      tipo,
      valor,
      probabilidad,
      activo,
    } = body;

    // --------------------------------------------------
    // ID
    // --------------------------------------------------

    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      return NextResponse.json(
        {
          error: "ID del premio requerido.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // BUSCAR PREMIO
    // --------------------------------------------------

    const premioExistente =
      await prisma.premio.findUnique({
        where: {
          id,
        },
      });

    if (!premioExistente) {
      return NextResponse.json(
        {
          error: "El premio no existe.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // CONSTRUIR DATOS A ACTUALIZAR
    // --------------------------------------------------

    const data: {
      nombre?: string;
      tipo?: string;
      valor?: number | null;
      probabilidad?: number;
      activo?: boolean;
    } = {};

    // --------------------------------------------------
    // NOMBRE
    // --------------------------------------------------

    if (nombre !== undefined) {
      if (
        typeof nombre !== "string" ||
        !nombre.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "El nombre no puede estar vacío.",
          },
          {
            status: 400,
          }
        );
      }

      data.nombre = nombre.trim();
    }

    // --------------------------------------------------
    // TIPO
    // --------------------------------------------------

    if (tipo !== undefined) {
      if (
        typeof tipo !== "string" ||
        !tipo.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "El tipo no puede estar vacío.",
          },
          {
            status: 400,
          }
        );
      }

      data.tipo = tipo.trim();
    }

    // --------------------------------------------------
    // VALOR
    // --------------------------------------------------

    if (valor !== undefined) {
      if (
        valor === null ||
        valor === ""
      ) {
        data.valor = null;
      } else {
        const numeroValor = Number(valor);

        if (
          Number.isNaN(numeroValor)
        ) {
          return NextResponse.json(
            {
              error:
                "El valor debe ser numérico.",
            },
            {
              status: 400,
            }
          );
        }

        data.valor = numeroValor;
      }
    }

    // --------------------------------------------------
    // PROBABILIDAD
    // --------------------------------------------------

    if (probabilidad !== undefined) {
      const numeroProbabilidad =
        Number(probabilidad);

      if (
        Number.isNaN(
          numeroProbabilidad
        ) ||
        numeroProbabilidad < 0 ||
        numeroProbabilidad > 100
      ) {
        return NextResponse.json(
          {
            error:
              "La probabilidad debe estar entre 0 y 100.",
          },
          {
            status: 400,
          }
        );
      }

      data.probabilidad =
        numeroProbabilidad;
    }

    // --------------------------------------------------
    // ACTIVO
    // --------------------------------------------------

    if (activo !== undefined) {
      if (
        typeof activo !== "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "El campo activo debe ser verdadero o falso.",
          },
          {
            status: 400,
          }
        );
      }

      data.activo = activo;
    }

    // --------------------------------------------------
    // ACTUALIZAR
    // --------------------------------------------------

    const premio =
      await prisma.premio.update({
        where: {
          id,
        },
        data,
      });

    return NextResponse.json(
      premio
    );
  } catch (error) {
    console.error(
      "ERROR PATCH /api/admin/roulette:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo actualizar el premio.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// DELETE
// Eliminar un premio
// ======================================================

export async function DELETE(
  request: Request
) {
  const noAutorizado = await exigirAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID del premio requerido.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // BUSCAR PREMIO
    // --------------------------------------------------

    const premio =
      await prisma.premio.findUnique({
        where: {
          id,
        },
      });

    if (!premio) {
      return NextResponse.json(
        {
          error:
            "El premio no existe.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // ELIMINAR
    // --------------------------------------------------

    await prisma.premio.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Premio eliminado correctamente.",
    });
  } catch (error) {
    console.error(
      "ERROR DELETE /api/admin/roulette:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo eliminar el premio.",
      },
      {
        status: 500,
      }
    );
  }
}