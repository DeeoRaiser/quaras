import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Obtener un centro de costo por ID
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const conn = await getConnection();

    const [rows] = await conn.query(
      "SELECT * FROM centros_costo WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Centro de costo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Error GET /centros-costo/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener centro de costo" },
      { status: 500 }
    );
  }
}

// Actualizar centro de costo
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const { nombre, descripcion } = await req.json();

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const conn = await getConnection();

    await conn.execute(
      `
      UPDATE centros_costo
      SET nombre = ?, descripcion = ?
      WHERE id = ?
    `,
      [nombre, descripcion || null, id]
    );

    return NextResponse.json(
      { message: "Centro de costo actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT /centros-costo/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar centro de costo" },
      { status: 500 }
    );
  }
}

// Eliminar centro de costo
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const conn = await getConnection();

    await conn.execute("DELETE FROM centros_costo WHERE id = ?", [id]);

    return NextResponse.json(
      { message: "Centro de costo eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error DELETE /centros-costo/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar centro de costo" },
      { status: 500 }
    );
  }
}
