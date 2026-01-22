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

// ====================
// GET - Listar cuentas
// ====================
export async function GET() {
  try {
    await requireAuth();

    const cuentas = await prisma.cuentas_bancarias.findMany({
      include: {
        bancos: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    // mismo formato que el SELECT con JOIN
    const result = cuentas.map(c => ({
      ...c,
      banco_nombre: c.bancos.nombre,
      banco: undefined,
    }));

    return json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "UNAUTHORIZED")
      return json({ error: "No autorizado" }, 401);

    return json({ error: "Error al obtener cuentas" }, 500);
  }
}

// ====================
// POST - Crear cuenta
// ====================
export async function POST(req) {
  try {
    await requireAuth();

    const { banco_id, tipo, moneda, numero, cbu, alias, nota } =
      await req.json();

    if (!banco_id || !tipo || !numero) {
      return json({ error: "Faltan datos obligatorios" }, 400);
    }

    await prisma.cuentas_bancarias.create({
      data: {
        banco_id: Number(banco_id),
        tipo,
        moneda: moneda || null,
        numero,
        cbu: cbu || null,
        alias: alias || null,
        nota: nota || null,
      },
    });

    return json({ message: "Cuenta creada correctamente" }, 201);
  } catch (error) {
    console.error(error);

    if (error.message === "UNAUTHORIZED")
      return json({ error: "No autorizado" }, 401);

    return json({ error: "Error al crear cuenta" }, 500);
  }
}
