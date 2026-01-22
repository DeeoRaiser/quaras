import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Crear IVA
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { descripcion, porcentaje } = await req.json();

    if (!descripcion || porcentaje === undefined) {
      return NextResponse.json(
        { error: "Descripción y porcentaje son obligatorios" },
        { status: 400 }
      );
    }

    await prisma.iva.create({
      data: {
        descripcion,
        porcentaje: Number(porcentaje),
      },
    });

    return NextResponse.json(
      { message: "IVA creado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /iva:", error);
    return NextResponse.json(
      { error: "Error al crear IVA" },
      { status: 500 }
    );
  }
}

// Obtener todos los IVA
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const iva = await prisma.iva.findMany({
      orderBy: {
        porcentaje: "asc",
      },
    });

    return NextResponse.json(iva, { status: 200 });
  } catch (error) {
    console.error("Error GET /iva:", error);
    return NextResponse.json(
      { error: "Error al obtener IVA" },
      { status: 500 }
    );
  }
}
