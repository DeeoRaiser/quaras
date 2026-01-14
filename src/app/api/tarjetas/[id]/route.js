import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { getConnection } from "@/lib/db";

// Obtener tarjeta
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM tarjetas_credito WHERE id = ?",
      [id]
    );

    if (!rows.length)
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET tarjeta:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// Actualizar tarjeta
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await req.json();
    const { id } = params;

    const conn = await getConnection();

    const fields = [];
    const values = [];

    for (const [k, v] of Object.entries(data)) {
      fields.push(`${k} = ?`);
      values.push(v);
    }

    values.push(id);

    await conn.execute(
      `UPDATE tarjetas_credito SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({ message: "Tarjeta actualizada" });
  } catch (error) {
    console.error("PUT tarjeta:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

// Eliminar tarjeta
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    await conn.execute("DELETE FROM tarjetas_credito WHERE id = ?", [id]);

    return NextResponse.json({ message: "Tarjeta eliminada" });
  } catch (error) {
    console.error("DELETE tarjeta:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
