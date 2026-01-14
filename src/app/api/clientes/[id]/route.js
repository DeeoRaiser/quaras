import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// 🔹 GET → obtener cliente por ID
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM clientes WHERE id = ?", [id]);

    if (rows.length === 0)
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET cliente error:", error);
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  }
}

// 🔹 PUT → editar cliente
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;
    const data = await req.json();

    const conn = await getConnection();

    await conn.execute(
      `UPDATE clientes SET
        nombre = ?, apellido = ?, dni = ?, cuit = ?, iva = ?, iibb = ?, numiibb = ?,
        direccion = ?, telefono = ?, email = ?, nota = ?
       WHERE id = ?`,
      [
        data.nombre,
        data.apellido,
        data.dni,
        data.cuit,
        data.iva,
        data.iibb,
        data.numiibb,
        data.direccion,
        data.telefono,
        data.email,
        data.nota,
        id,
      ]
    );

    return NextResponse.json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("PUT cliente error:", error);
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 });
  }
}

// 🔹 DELETE → eliminar cliente
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    const [res] = await conn.execute("DELETE FROM clientes WHERE id = ?", [id]);

    if (res.affectedRows === 0)
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

    return NextResponse.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("DELETE cliente error:", error);
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 });
  }
}
