import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { getConnection } from "@/lib/db";

// ➤ Obtener una categoría
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM categorias WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0)
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET categoria error:", error);
    return NextResponse.json({ error: "Error al obtener categoría" }, { status: 500 });
  }
}

// ➤ Actualizar categoría
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;
    const data = await req.json();
    const { nombre, tipo, descripcion, activo } = data;

    const conn = await getConnection();
    const [result] = await conn.execute(
      `UPDATE categorias SET 
        nombre = ?, 
        tipo = ?, 
        descripcion = ?, 
        activo = ?
       WHERE id = ?`,
      [
        nombre,
        tipo || "gasto",
        descripcion || null,
        activo ?? 1,
        id
      ]
    );

    if (result.affectedRows === 0)
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

    return NextResponse.json({ message: "Categoría actualizada correctamente" });
  } catch (error) {
    console.error("PUT categoria error:", error);
    return NextResponse.json({ error: "Error al actualizar categoría" }, { status: 500 });
  }
}

// ➤ Eliminar categoría
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    const [result] = await conn.execute(
      "DELETE FROM categorias WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });

    return NextResponse.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("DELETE categoria error:", error);
    return NextResponse.json({ error: "Error al eliminar categoría" }, { status: 500 });
  }
}
