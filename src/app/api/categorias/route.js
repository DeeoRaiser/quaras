import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import {prisma} from "@/lib/prisma";

/* ➤ Crear categoría */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { nombre, tipo, descripcion } = await req.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    await prisma.categorias.create({
      data: {
        nombre,
        tipo: tipo || "gasto",
        descripcion: descripcion || null
      }
    });

    return NextResponse.json(
      { message: "Categoría creada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST categorias error:", error);
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 }
    );
  }
}

/* ➤ Listar categorías */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const categorias = await prisma.categorias.findMany({
      orderBy: {
        id: "desc"
      }
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("GET categorias error:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
