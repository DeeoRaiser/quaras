import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Obtener un IVA
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    const iva = await prisma.iva.findUnique({
      where: { id: Number(id) },
    });

    if (!iva) {
      return NextResponse.json({ error: "IVA no encontrado" }, { status: 404 });
    }

    return NextResponse.json(iva, { status: 200 });
  } catch (error) {
    console.error("Error GET /iva/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener IVA" },
      { status: 500 }
    );
  }
}

// Editar IVA
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const { descripcion, porcentaje } = await req.json();

    if (!descripcion || porcentaje === undefined) {
      return NextResponse.json(
        { error: "Descripción y porcentaje son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar existencia
    const exists = await prisma.iva.findUnique({
      where: { id: Number(id) },
    });

    if (!exists) {
      return NextResponse.json({ error: "IVA no encontrado" }, { status: 404 });
    }

    await prisma.iva.update({
      where: { id: Number(id) },
      data: {
        descripcion,
        porcentaje: Number(porcentaje),
      },
    });

    return NextResponse.json(
      { message: "IVA actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT /iva/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar IVA" },
      { status: 500 }
    );
  }
}
