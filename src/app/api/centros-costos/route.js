import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";


// -----------------------------------------------------
// POST: Crear centro de costo
// -----------------------------------------------------
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { nombre, descripcion } = await req.json();

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    await prisma.centros_costos.create({
      data: {
        nombre,
        descripcion: descripcion ?? null
      }
    });

    return NextResponse.json(
      { message: "Centro de costo creado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /centros-costo:", error);
    return NextResponse.json(
      { error: "Error al crear centro de costo" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// GET: Listar centros de costo
// -----------------------------------------------------
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const centros = await prisma.centros_costos.findMany({
      orderBy: {
        id: "desc"
      }
    });

    return NextResponse.json(centros, { status: 200 });
  } catch (error) {
    console.error("Error GET /centros-costo:", error);
    return NextResponse.json(
      { error: "Error al obtener centros de costo" },
      { status: 500 }
    );
  }
}
