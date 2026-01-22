import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================
// POST → CREAR CONCEPTO
// ==========================
export async function POST(req) {
  try {
    const data = await req.json();
    const { nombre, parent_id } = data;

    await prisma.clasificacion_conceptos_bancarios.create({
      data: {
        nombre,
        parent_id: parent_id || null
      }
    });

    return NextResponse.json(
      { message: "Concepto creado correctamente" },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST concepto bancario error:", error);

    return NextResponse.json(
      { error: "Error al crear concepto" },
      { status: 500 }
    );
  }
}

// ==========================
// GET → LISTAR CONCEPTOS
// ==========================
export async function GET() {
  try {
    const conceptos = await prisma.clasificacion_conceptos_bancarios.findMany({
      orderBy: {
        nombre: "desc"
      }
    });

    return NextResponse.json(conceptos);

  } catch (error) {
    console.error("GET conceptos bancarios error:", error);

    return NextResponse.json(
      { error: "Error al obtener los conceptos" },
      { status: 500 }
    );
  }
}
