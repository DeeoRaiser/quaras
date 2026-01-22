import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import {prisma} from "@/lib/prisma";

/* =============================
   CREAR TARJETA
============================= */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const {
      nombre,
      entidad,
      tipo,
      comision_porcentaje,
      comision_fija,
      nota
    } = await req.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    await prisma.tarjetas_credito.create({
      data: {
        nombre,
        entidad: entidad || null,
        tipo: tipo || "credito",
        comision_porcentaje: comision_porcentaje ?? 0,
        comision_fija: comision_fija ?? 0,
        nota: nota || null
      }
    });

    return NextResponse.json(
      { message: "Tarjeta creada correctamente" },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST tarjeta:", error);
    return NextResponse.json(
      { error: "Error al crear tarjeta" },
      { status: 500 }
    );
  }
}

/* =============================
   LISTAR TARJETAS
============================= */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const tarjetas = await prisma.tarjetas_credito.findMany({
      orderBy: { id: "desc" }
    });

    return NextResponse.json(tarjetas);

  } catch (error) {
    console.error("GET tarjetas:", error);
    return NextResponse.json(
      { error: "Error al obtener tarjetas" },
      { status: 500 }
    );
  }
}
