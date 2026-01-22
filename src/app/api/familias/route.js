import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =======================
// POST → crear familia
// =======================
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { descripcion } = await req.json();

    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    await prisma.familias.create({
      data: {
        descripcion,
      },
    });

    return NextResponse.json(
      { message: "Familia creada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /familias:", error);
    return NextResponse.json(
      { error: "Error al crear familia" },
      { status: 500 }
    );
  }
}

// =======================
// GET → listar familias
// =======================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const familias = await prisma.familias.findMany({
      orderBy: {
        nombre: "asc", // antes ORDER BY nombre (corregido)
      },
    });

    return NextResponse.json(familias, { status: 200 });
  } catch (error) {
    console.error("Error GET /familias:", error);
    return NextResponse.json(
      { error: "Error al obtener familias" },
      { status: 500 }
    );
  }
}
