import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

/* =============================
   ➤ OBTENER UN PROVEEDOR
============================= */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);

    const proveedor = await prisma.proveedores.findUnique({
      where: { id }
    });

    if (!proveedor) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(proveedor);

  } catch (error) {
    console.error("GET proveedor error:", error);
    return NextResponse.json(
      { error: "Error al obtener proveedor" },
      { status: 500 }
    );
  }
}

/* =============================
   ➤ ACTUALIZAR PROVEEDOR
============================= */
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // ✅ params es Promise en Route Handlers
    const { id } = await params;
    const proveedorId = Number(id);

    if (!proveedorId || isNaN(proveedorId)) {
      return NextResponse.json(
        { error: "ID de proveedor inválido" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const {
      nombre,
      cuit,
      direccion,
      telefono,
      email,
      nota
    } = data;

    await prisma.proveedores.update({
      where: { id: proveedorId },
      data: {
        nombre: nombre ?? null,
        cuit: cuit ?? null,
        direccion: direccion ?? null,
        telefono: telefono ?? null,
        email: email ?? null,
        nota: nota ?? null
      }
    });

    return NextResponse.json({
      message: "Proveedor actualizado correctamente"
    });

  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    console.error("PUT proveedor error:", error);
    return NextResponse.json(
      { error: "Error al actualizar proveedor" },
      { status: 500 }
    );
  }
}

/* =============================
   ➤ ELIMINAR PROVEEDOR
============================= */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);

    await prisma.proveedores.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Proveedor eliminado correctamente"
    });

  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    console.error("DELETE proveedor error:", error);
    return NextResponse.json(
      { error: "Error al eliminar proveedor" },
      { status: 500 }
    );
  }
}
