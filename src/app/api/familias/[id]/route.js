import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =======================
// GET → obtener una familia
// =======================
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const familia = await prisma.familias.findUnique({
      where: { id },
    });

    if (!familia) {
      return NextResponse.json(
        { error: "Familia no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(familia, { status: 200 });
  } catch (error) {
    console.error("Error GET /familias/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener familia" },
      { status: 500 }
    );
  }
}

// =======================
// PUT → editar familia
// =======================
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { descripcion } = await req.json();

    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    await prisma.familias.update({
      where: { id },
      data: { descripcion },
    });

    return NextResponse.json(
      { message: "Familia actualizada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT /familias/[id]:", error);

    // Manejo de registro inexistente
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Familia no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar familia" },
      { status: 500 }
    );
  }
}

// =======================
// DELETE → eliminar familia
// =======================
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.familias.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Familia eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error DELETE /familias/[id]:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Familia no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar familia" },
      { status: 500 }
    );
  }
}
