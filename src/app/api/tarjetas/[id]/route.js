import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import {prisma} from "@/lib/prisma";

/* =============================
   OBTENER TARJETA
============================= */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const tarjeta = await prisma.tarjetas_credito.findUnique({
      where: { id: Number(id) }
    });

    if (!tarjeta)
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    return NextResponse.json(tarjeta);

  } catch (error) {
    console.error("GET tarjeta:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* =============================
   ACTUALIZAR TARJETA
============================= */
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;
    const data = await req.json();

    await prisma.tarjetas_credito.update({
      where: { id: Number(id) },
      data
    });

    return NextResponse.json({ message: "Tarjeta actualizada" });

  } catch (error) {
    console.error("PUT tarjeta:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "No encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* =============================
   ELIMINAR TARJETA
============================= */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    await prisma.tarjetas_credito.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: "Tarjeta eliminada" });

  } catch (error) {
    console.error("DELETE tarjeta:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "No encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
