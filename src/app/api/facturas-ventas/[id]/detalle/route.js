import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

// Agregar detalle a factura
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id: facturaId } = params;
    const { articulo_id = null, descripcion = "", cantidad = 1, precio = 0 } = await req.json();

    const subtotal = Number(cantidad) * Number(precio);

    const conn = await getConnection();
    await conn.execute(
      `INSERT INTO factura_detalle (factura_id, articulo_id, descripcion, cantidad, precio, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [facturaId, articulo_id, descripcion, cantidad, precio, subtotal]
    );

    // recalcular total de factura
    const [rows] = await conn.query("SELECT COALESCE(SUM(subtotal),0) AS total FROM factura_detalle WHERE factura_id = ?", [facturaId]);
    const total = rows[0].total;
    await conn.execute("UPDATE facturas SET total = ? WHERE id = ?", [total, facturaId]);

    return NextResponse.json({ message: "Detalle agregado", total });
  } catch (error) {
    console.error("POST detalle error:", error);
    return NextResponse.json({ error: "Error al agregar detalle" }, { status: 500 });
  }
}

// Eliminar linea detalle por id (body: { detalle_id })
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id: facturaId } = await context.params;
    const { detalle_id } = await req.json();

    const conn = await getConnection();
    await conn.execute("DELETE FROM factura_detalle WHERE id = ? AND factura_id = ?", [detalle_id, facturaId]);

    const [rows] = await conn.query("SELECT COALESCE(SUM(subtotal),0) AS total FROM factura_detalle WHERE factura_id = ?", [facturaId]);
    const total = rows[0].total;
    await conn.execute("UPDATE facturas SET total = ? WHERE id = ?", [total, facturaId]);

    return NextResponse.json({ message: "Detalle eliminado", total });
  } catch (error) {
    console.error("DELETE detalle error:", error);
    return NextResponse.json({ error: "Error al eliminar detalle" }, { status: 500 });
  }
}
