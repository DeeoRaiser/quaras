import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

// ➤ Obtener un solo proveedor
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM proveedores WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET proveedor error:", error);
    return NextResponse.json(
      { error: "Error al obtener proveedor" },
      { status: 500 }
    );
  }
}

// ➤ Actualizar proveedor
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();

    const {
      nombre,
      cuit,
      direccion,
      telefono,
      email,
      contacto,
      nota
    } = data;

    const conn = await getConnection();
    const [result] = await conn.execute(
      `UPDATE proveedores SET 
        nombre = ?, 
        cuit = ?, 
        direccion = ?, 
        telefono = ?, 
        email = ?, 
        contacto = ?, 
        nota = ?
       WHERE id = ?`,
      [
        nombre || null,
        cuit || null,
        direccion || null,
        telefono || null,
        email || null,
        contacto || null,
        nota || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Proveedor actualizado correctamente"
    });
  } catch (error) {
    console.error("PUT proveedor error:", error);
    return NextResponse.json(
      { error: "Error al actualizar proveedor" },
      { status: 500 }
    );
  }
}

// ➤ Eliminar proveedor
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 👇 esto resuelve params correctamente
    const { id } = await context.params;

    console.log("ID RECIBIDO:", id);

    const conn = await getConnection();
    const [result] = await conn.execute(
      "DELETE FROM proveedores WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Proveedor eliminado correctamente"
    });

  } catch (error) {
    console.error("DELETE proveedor error:", error);
    return NextResponse.json(
      { error: "Error al eliminar proveedor" },
      { status: 500 }
    );
  }
}

