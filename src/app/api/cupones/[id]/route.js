import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// ======================================================
// GET /api/cupones/[id]  → Obtener cupón por ID
// ======================================================
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM cupones WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener el cupón" },
      { status: 500 }
    );
  }
}

// ======================================================
// PUT /api/cupones/[id]  → Actualizar cupón
// ======================================================
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();

    const {
      codigo,
      descripcion,
      porcentaje,
      monto_fijo,
      fecha_inicio,
      fecha_fin,
      limite_uso,
      activo,
    } = data;

    const conn = await getConnection();

    const query = `
      UPDATE cupones SET
        codigo = ?,
        descripcion = ?,
        porcentaje = ?,
        monto_fijo = ?,
        fecha_inicio = ?,
        fecha_fin = ?,
        limite_uso = ?,
        activo = ?
      WHERE id = ?
    `;

    const values = [
      codigo,
      descripcion,
      porcentaje,
      monto_fijo,
      fecha_inicio,
      fecha_fin,
      limite_uso,
      activo,
      id,
    ];

    const [result] = await conn.execute(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Cupón actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar el cupón" },
      { status: 500 }
    );
  }
}

// ======================================================
// DELETE /api/cupones/[id]  → Eliminar cupón
// ======================================================
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const conn = await getConnection();

    const [result] = await conn.execute(
      "DELETE FROM cupones WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Cupón eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar el cupón" },
      { status: 500 }
    );
  }
}
