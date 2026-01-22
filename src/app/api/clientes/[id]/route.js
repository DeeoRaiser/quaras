import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";


// -----------------------------------------------------
// GET → obtener cliente por ID
// -----------------------------------------------------
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("GET cliente error:", error);
    return NextResponse.json(
      { error: "Error al obtener cliente" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// PUT → editar cliente
// -----------------------------------------------------
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // 🔥 ESTE ES EL CAMBIO CLAVE
    const { id } = await params;
    const clienteId = Number(id);

    if (!clienteId) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const data = await req.json();

    await prisma.clientes.update({
      where: { id: clienteId },
      data: {
        nombre: data.nombre ?? null,
        apellido: data.apellido ?? null,
        dni: data.dni ?? null,
        cuit: data.cuit ?? null,
        iva: data.iva ?? null,
        iibb: data.iibb ?? null,
        numiibb: data.numiibb ?? null,
        direccion: data.direccion ?? null,
        telefono: data.telefono ?? null,
        email: data.email ?? null,
        nota: data.nota ?? null,
      },
    });

    return NextResponse.json({
      message: "Cliente actualizado correctamente",
    });
  } catch (error) {
    console.error("PUT cliente error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}



// -----------------------------------------------------
// DELETE → eliminar cliente
// -----------------------------------------------------
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    await prisma.cliente.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({
      message: "Cliente eliminado correctamente"
    });
  } catch (error) {
    console.error("DELETE cliente error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}
