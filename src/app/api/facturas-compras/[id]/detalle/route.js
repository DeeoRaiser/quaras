import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

/* =========================
   AGREGAR DETALLE
========================= */
export async function POST(req, { params }) {
  const conn = await getConnection();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: facturaId } = await params;

    const {
      articulo_id = null,
      descripcion,
      cantidad = 1,
      precio_compra = 0,
      iva = 0,
      ajuste = 0
    } = await req.json();

    const subtotal =
      Number(cantidad) * Number(precio_compra) +
      Number(ajuste) +
      Number(iva);

    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO factura_compra_detalle
        (factura_id, articulo_id, descripcion, cantidad, precio_compra, iva, ajuste, subtotal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        facturaId,
        articulo_id,
        descripcion,
        cantidad,
        precio_compra,
        iva,
        ajuste,
        subtotal
      ]
    );

    // recalcular total factura
    const [[{ total }]] = await conn.query(
      `SELECT COALESCE(SUM(subtotal),0) AS total
       FROM factura_compra_detalle
       WHERE factura_id = ?`,
      [facturaId]
    );

    await conn.execute(
      `UPDATE factura_compras
       SET total = ?, saldo = ?
       WHERE id = ?`,
      [total, total, facturaId]
    );

    await conn.commit();

    return NextResponse.json({
      message: "Detalle agregado correctamente",
      total
    });

  } catch (error) {
    await conn.rollback();
    console.error("POST detalle compra error:", error);
    return NextResponse.json(
      { error: "Error al agregar detalle" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

/* =========================
   ELIMINAR DETALLE
========================= */
export async function DELETE(req, { params }) {
  const conn = await getConnection();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: facturaId } = await params;
    const { detalle_id } = await req.json();

    if (!detalle_id) {
      return NextResponse.json(
        { error: "detalle_id requerido" },
        { status: 400 }
      );
    }

    await conn.beginTransaction();

    await conn.execute(
      `DELETE FROM factura_compra_detalle
       WHERE id = ? AND factura_id = ?`,
      [detalle_id, facturaId]
    );

    const [[{ total }]] = await conn.query(
      `SELECT COALESCE(SUM(subtotal),0) AS total
       FROM factura_compra_detalle
       WHERE factura_id = ?`,
      [facturaId]
    );

    await conn.execute(
      `UPDATE factura_compras
       SET total = ?, saldo = ?
       WHERE id = ?`,
      [total, total, facturaId]
    );

    await conn.commit();

    return NextResponse.json({
      message: "Detalle eliminado correctamente",
      total
    });

  } catch (error) {
    await conn.rollback();
    console.error("DELETE detalle compra error:", error);
    return NextResponse.json(
      { error: "Error al eliminar detalle" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
