import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";


// -----------------------------------------------------
// GET: Listar categorías activas
// -----------------------------------------------------
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const categorias = await prisma.categoriaGasto.findMany({
      where: {
        estado: 1
      },
      include: {
        centroCosto: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    });

    // Mantiene la estructura original del SELECT
    const result = categorias.map(c => ({
      ...c,
      centro_costo: c.centroCosto.nombre
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener categorías de gastos" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// POST: Crear categoría
// -----------------------------------------------------
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { nombre, descripcion, centro_costo_id, tipo, iva } = await req.json();

    if (!nombre || !centro_costo_id) {
      return NextResponse.json(
        { error: "Nombre y centro de costo son obligatorios" },
        { status: 400 }
      );
    }

    await prisma.categoriaGasto.create({
      data: {
        nombre,
        descripcion: descripcion ?? null,
        tipo: tipo ?? "general",
        iva: iva ?? 21.00,
        centroCostoId: Number(centro_costo_id)
      }
    });

    return NextResponse.json(
      { message: "Categoría creada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// PUT: Actualizar categoría
// -----------------------------------------------------
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID de la categoría" },
        { status: 400 }
      );
    }

    const { nombre, descripcion, centro_costo_id, tipo, iva, estado } =
      await req.json();

    await prisma.categoriaGasto.update({
      where: {
        id: Number(id)
      },
      data: {
        nombre,
        descripcion: descripcion ?? null,
        tipo: tipo ?? "general",
        iva: iva ?? 21.00,
        estado: estado ?? 1,
        centroCostoId: Number(centro_costo_id)
      }
    });

    return NextResponse.json({
      message: "Categoría actualizada correctamente"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar categoría" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// DELETE: Borrado lógico (estado = 0)
// -----------------------------------------------------
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID de la categoría" },
        { status: 400 }
      );
    }

    await prisma.categoriaGasto.update({
      where: {
        id: Number(id)
      },
      data: {
        estado: 0
      }
    });

    return NextResponse.json({
      message: "Categoría eliminada correctamente (borrado lógico)"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 }
    );
  }
}
