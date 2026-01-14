import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

/* =========================
   OBTENER FACTURA COMPRA
========================= */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const conn = await getConnection();

    /* ===== Cabecera ===== */
    const [[factura]] = await conn.query(
      `
      SELECT fc.*,
             p.nombre AS proveedor_nombre,
             p.cuit AS proveedor_cuit
      FROM factura_compras fc
      LEFT JOIN proveedores p ON p.id = fc.proveedor_id
      WHERE fc.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!factura) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    /* ===== Detalle ===== */
    const [detalle] = await conn.query(
      `
      SELECT fcd.*,
             a.codigo AS articulo_codigo
      FROM factura_compra_detalle fcd
      LEFT JOIN articulos_compras a ON a.id = fcd.articulo_id
      WHERE fcd.factura_id = ?
      ORDER BY fcd.id ASC
      `,
      [id]
    );

    /* ===== Pagos aplicados ===== */
    const [pagos] = await conn.query(
      `
      SELECT pc.*, ap.monto_aplicado
      FROM aplicaciones_pagos_compras ap
      INNER JOIN pagos_compras pc ON pc.id = ap.pago_id
      WHERE ap.factura_id = ?
      ORDER BY pc.fecha ASC, pc.id ASC
      `,
      [id]
    );

    factura.detalle = detalle;
    factura.pagos = pagos;

    return NextResponse.json(factura);

  } catch (error) {
    console.error("GET factura compra error:", error);
    return NextResponse.json(
      { error: "Error al obtener factura" },
      { status: 500 }
    );
  }
}

/* =========================
   EDITAR CABECERA
========================= */
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const {
      fecha,
      numero,
      letra,
      punto_vta,
      observacion
    } = await req.json();

    const conn = await getConnection();

    const [res] = await conn.execute(
      `
      UPDATE factura_compras
      SET fecha = ?,
          numero = ?,
          letra = ?,
          punto_vta = ?,
          observacion = ?
      WHERE id = ?
      `,
      [
        fecha ?? null,
        numero ?? null,
        letra ?? null,
        punto_vta ?? null,
        observacion ?? null,
        id
      ]
    );

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Factura actualizada correctamente"
    });

  } catch (error) {
    console.error("PUT factura compra error:", error);
    return NextResponse.json(
      { error: "Error al actualizar factura" },
      { status: 500 }
    );
  }
}

/* =========================
   ELIMINAR FACTURA (OPCIONAL)
========================= */
export async function DELETE(req, { params }) {
  const conn = await getConnection();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await conn.beginTransaction();

    await conn.execute(
      `DELETE FROM aplicaciones_pagos_compras WHERE factura_id = ?`,
      [id]
    );

    await conn.execute(
      `DELETE FROM pagos_compras WHERE factura_id = ?`,
      [id]
    );

    await conn.execute(
      `DELETE FROM factura_compra_detalle WHERE factura_id = ?`,
      [id]
    );

    await conn.execute(
      `DELETE FROM factura_compras WHERE id = ?`,
      [id]
    );

    await conn.commit();

    return NextResponse.json({ message: "Factura eliminada correctamente" });

  } catch (error) {
    await conn.rollback();
    console.error("DELETE factura compra error:", error);
    return NextResponse.json(
      { error: "Error al eliminar factura" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
