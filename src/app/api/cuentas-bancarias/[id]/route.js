import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("UNAUTHORIZED");
}

// ============
// PUT → Modificar cuenta bancaria
// ============
export async function PUT(req, { params }) {
  try {
    await requireAuth();

    const id = Number(params.id);
    const { tipo, moneda, numero, cbu, alias, nota } = await req.json();

    await prisma.cuentas_bancarias.update({
      where: { id },
      data: {
        tipo,
        moneda,
        numero,
        cbu: cbu || null,
        alias: alias || null,
        nota: nota || null,
      },
    });

    return json({ message: "Cuenta modificada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.message === "UNAUTHORIZED")
      return json({ error: "No autorizado" }, 401);

    return json({ error: "Error al modificar cuenta" }, 500);
  }
}

// ============
// DELETE → Eliminar cuenta bancaria
// ============
export async function DELETE(req, { params }) {
  try {
    await requireAuth();

    const id = Number(params.id);

    await prisma.cuentas_bancarias.delete({
      where: { id },
    });

    return json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error(error);

    if (error.message === "UNAUTHORIZED")
      return json({ error: "No autorizado" }, 401);

    return json({ error: "Error al eliminar cuenta" }, 500);
  }
}
