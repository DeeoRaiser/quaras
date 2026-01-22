import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";


// -----------------------------------------------------
// GET: Obtener un centro de costo por ID
// -----------------------------------------------------
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);

    const centro = await prisma.centros_costos.findUnique({
      where: { id }
    });

    if (!centro) {
      return NextResponse.json(
        { error: "Centro de costo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(centro, { status: 200 });
  } catch (error) {
    console.error("Error GET /centros-costo/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener centro de costo" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// PUT: Actualizar centro de costo
// -----------------------------------------------------
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);
    const { nombre, descripcion } = await req.json();

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    // Validar existencia
    const existe = await prisma.centros_costos.findUnique({
      where: { id }
    });

    if (!existe) {
      return NextResponse.json(
        { error: "Centro de costo no encontrado" },
        { status: 404 }
      );
    }

    await prisma.centros_costos.update({
      where: { id },
      data: {
        nombre,
        descripcion: descripcion ?? null
      }
    });

    return NextResponse.json(
      { message: "Centro de costo actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT /centros-costo/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar centro de costo" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// DELETE: Eliminar centro de costo
// -----------------------------------------------------
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = Number(params.id);

    // Validar existencia
    const existe = await prisma.centros_costos.findUnique({
      where: { id }
    });

    if (!existe) {
      return NextResponse.json(
        { error: "Centro de costo no encontrado" },
        { status: 404 }
      );
    }

    await prisma.centros_costos.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Centro de costo eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error DELETE /centros-costo/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar centro de costo" },
      { status: 500 }
    );
  }
}
