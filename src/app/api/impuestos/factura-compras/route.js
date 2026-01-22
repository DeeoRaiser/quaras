import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const impuestos = await prisma.impuestos.findMany({
      select: {
        id: true,
        codigo: true,
        nombre: true,
        alicuota: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    return NextResponse.json(impuestos, { status: 200 });
  } catch (error) {
    console.error("Error GET /impuestos:", error);
    return NextResponse.json(
      { error: "Error al obtener los impuestos" },
      { status: 500 }
    );
  }
}
