import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================
// POST → CREAR BANCO
// ==========================
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { nombre, sucursal, nro_cuenta, cbu, nota } = await req.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre del banco es obligatorio" },
        { status: 400 }
      );
    }

    await prisma.bancos.create({
      data: {
        nombre,
        sucursal,
        nro_cuenta,
        cbu,
        nota
      }
    });

    return NextResponse.json(
      { message: "Banco creado correctamente" },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /bancos error:", error);

    return NextResponse.json(
      { error: "Error al crear banco" },
      { status: 500 }
    );
  }
}

// ==========================
// GET → LISTAR BANCOS
// ==========================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const bancos = await prisma.bancos.findMany({
      orderBy: {
        id: "desc"
      }
    });

    return NextResponse.json(bancos, { status: 200 });

  } catch (error) {
    console.error("GET /bancos error:", error);

    return NextResponse.json(
      { error: "Error al obtener los bancos" },
      { status: 500 }
    );
  }
}
