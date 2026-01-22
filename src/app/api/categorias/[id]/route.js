import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { prisma } from "@/lib/prisma";

// ==========================
// GET → OBTENER CATEGORÍA
// ==========================
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = Number(params.id);

    const categoria = await prisma.categorias.findUnique({
      where: { id }
    });

    if (!categoria) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(categoria);

  } catch (error) {
    console.error("GET categoria error:", error);

    return NextResponse.json(
      { error: "Error al obtener categoría" },
      { status: 500 }
    );
  }
}

// ==========================
// PUT → ACTUALIZAR CATEGORÍA
// ==========================
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = Number(params.id);
    const data = await req.json();

    const {
      nombre,
      tipo = "gasto",
      descripcion = null,
      activo = true
    } = data;

    await prisma.categorias.update({
      where: { id },
      data: {
        nombre,
        tipo,
        descripcion,
        activo
      }
    });

    return NextResponse.json({
      message: "Categoría actualizada correctamente"
    });

  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    console.error("PUT categoria error:", error);

    return NextResponse.json(
      { error: "Error al actualizar categoría" },
      { status: 500 }
    );
  }
}

// ==========================
// DELETE → ELIMINAR CATEGORÍA
// ==========================
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = Number(params.id);

    await prisma.categorias.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Categoría eliminada correctamente"
    });

  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    console.error("DELETE categoria error:", error);

    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 }
    );
  }
}
