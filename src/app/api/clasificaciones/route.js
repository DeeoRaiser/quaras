import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";


// -----------------------------------------------------
// POST: Crear clasificación
// -----------------------------------------------------
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { descripcion } = await req.json();

    if (!descripcion) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    await prisma.clasificaciones.create({
      data: { descripcion }
    });

    return NextResponse.json(
      { message: "Clasificación creada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /clasificaciones:", error);
    return NextResponse.json(
      { error: "Error al crear clasificación" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// GET: Obtener todas las clasificaciones
// -----------------------------------------------------
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const clasificaciones = await prisma.clasificaciones.findMany({
      orderBy: {
        nombre: "asc"
      }
    });

    return NextResponse.json(clasificaciones, { status: 200 });
  } catch (error) {
    console.error("Error GET /clasificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener clasificaciones" },
      { status: 500 }
    );
  }
}
