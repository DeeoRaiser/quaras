import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Obtener un IVA
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM iva WHERE id = ?", [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "IVA no encontrado" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Error GET /iva/[id]:", error);
    return NextResponse.json({ error: "Error al obtener IVA" }, { status: 500 });
  }
}

// Editar IVA
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;
    const { descripcion, porcentaje } = await req.json();

    if (!descripcion || porcentaje === undefined) {
      return NextResponse.json(
        { error: "Descripción y porcentaje son obligatorios" },
        { status: 400 }
      );
    }

    const conn = await getConnection();
    await conn.execute(
      "UPDATE iva SET descripcion = ?, porcentaje = ? WHERE id = ?",
      [descripcion, porcentaje, id]
    );

    return NextResponse.json(
      { message: "IVA actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT /iva/[id]:", error);
    return NextResponse.json({ error: "Error al actualizar IVA" }, { status: 500 });
  }
}

// Eliminar IVA
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    await conn.execute("DELETE FROM iva WHERE id = ?", [id]);

    return NextResponse.json(
      { message: "IVA eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error DELETE /iva/[id]:", error);
    return NextResponse.json({ error: "Error al eliminar IVA" }, { status: 500 });
  }
}
