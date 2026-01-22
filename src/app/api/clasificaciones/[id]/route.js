import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";


// -----------------------------------------------------
// GET: Obtener una clasificación
// -----------------------------------------------------
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);

    const clasificacion = await prisma.clasificaciones.findUnique({
      where: { id }
    });

    if (!clasificacion) {
      return NextResponse.json(
        { error: "Clasificación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(clasificacion, { status: 200 });
  } catch (error) {
    console.error("Error GET /clasificaciones/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener clasificación" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// PUT: Editar clasificación
// -----------------------------------------------------
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);
    const { descripcion } = await req.json();

    if (!descripcion) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    await prisma.clasificaciones.update({
      where: { id },
      data: { descripcion }
    });

    return NextResponse.json(
      { message: "Clasificación actualizada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT /clasificaciones/[id]:", error);

    // Manejo de ID inexistente
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Clasificación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar clasificación" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// DELETE: Eliminar clasificación
// -----------------------------------------------------
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);

    await prisma.clasificaciones.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Clasificación eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error DELETE /clasificaciones/[id]:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Clasificación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar clasificación" },
      { status: 500 }
    );
  }
}
