import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const conn = await getConnection();

    /* =============================
       1️⃣ FACTURA BASE + CLIENTE
    ============================= */
    const [factRows] = await conn.query(
      `
      SELECT 
        f.id,
        f.punto_vta,
        f.numero,
        f.letra,
        f.fecha,
        f.cliente_id,
        COALESCE(c.nombre, '') AS cliente_nombre,
        COALESCE(c.dni, '') AS cliente_dni,
        COALESCE(f.total, 0) AS totalFactura,
        COALESCE(SUM(ap.monto_aplicado), 0) AS totalPagado
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      LEFT JOIN aplicaciones_pagos ap ON ap.factura_id = f.id
      WHERE f.id = ?
      GROUP BY f.id
      LIMIT 1
      `,
      [id]
    );

    if (factRows.length === 0) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const factura = factRows[0];

    /* =============================
       2️⃣ DETALLE
    ============================= */
    const [detalle] = await conn.query(
      `
      SELECT 
        id,
        factura_id,
        articulo_id,
        descripcion,
        cantidad,
        ajuste,
        precio_venta,
        iva,
        subtotal
      FROM factura_detalle
      WHERE factura_id = ?
      ORDER BY id
      `,
      [id]
    );

    /* =============================
       3️⃣ IMPUESTOS
    ============================= */
    const [impuestos] = await conn.query(
      `
      SELECT
        id,
        factura_id,
        impuesto_id,
        codigo,
        nombre,
        alicuota,
        base_imponible,
        monto
      FROM factura_venta_impuestos
      WHERE factura_id = ?
      ORDER BY id
      `,
      [id]
    );

    /* =============================
       4️⃣ AJUSTES PIE
    ============================= */
    const [ajustesPie] = await conn.query(
      `
      SELECT 
        id,
        factura_id,
        nombre,
        porcentaje,
        monto
      FROM factura_ajustes_pie
      WHERE factura_id = ?
      ORDER BY id
      `,
      [id]
    );

    /* =============================
       5️⃣ PAGOS APLICADOS
    ============================= */
    const [pagos] = await conn.query(
      `
      SELECT 
        p.id,
        ap.factura_id,
        p.fecha,
        p.metodo,
        ap.monto_aplicado
      FROM aplicaciones_pagos ap
      INNER JOIN pagos p ON p.id = ap.pago_id
      WHERE ap.factura_id = ?
      ORDER BY p.fecha ASC, p.id ASC
      `,
      [id]
    );

    /* =============================
       6️⃣ CÁLCULOS
    ============================= */
    const totalFactura = Number(factura.totalFactura) || 0;
    const totalPagado = Number(factura.totalPagado) || 0;
    const saldo = Math.max(0, +(totalFactura - totalPagado).toFixed(2));

    /* =============================
       7️⃣ RESPUESTA FINAL
    ============================= */
    return NextResponse.json({
      ...factura,
      detalle,
      impuestos,
      ajustesPie,
      pagos,
      totalFactura: totalFactura.toFixed(2),
      totalPagado: totalPagado.toFixed(2),
      saldoPendiente: saldo.toFixed(2),
      estado:
        saldo <= 0
          ? "PAGADA"
          : totalPagado > 0
          ? "PARCIAL"
          : "PENDIENTE",
    });
  } catch (error) {
    console.error("GET factura error:", error);
    return NextResponse.json(
      { error: "Error al obtener factura" },
      { status: 500 }
    );
  }
}


// Editar cabecera factura (no maneja detalle acá)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;
    const data = await req.json();
    const { fecha, numero, letra, punto_vta, observacion } = data;

    const conn = await getConnection();
    const [res] = await conn.execute(
      `UPDATE facturas SET fecha = ?, numero = ?, letra = ?, punto_vta = ?, observacion = ? WHERE id = ?`,
      [fecha || null, numero || null, letra || null, punto_vta || null, observacion || null, id]
    );

    if (res.affectedRows === 0) return NextResponse.json({ error: "Factura no encontrada" }, { status: 405 });

    return NextResponse.json({ message: "Factura actualizada correctamente" });
  } catch (error) {
    console.error("PUT factura error:", error);
    return NextResponse.json({ error: "Error al actualizar factura" }, { status: 500 });
  }
}

// DELETE opcional: solo si querés permitir borrar facturas (considerar reglas fiscales)
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await context.params;
    const conn = await getConnection();
    await conn.execute("DELETE FROM facturas WHERE id = ?", [id]);

    return NextResponse.json({ message: "Factura eliminada" });
  } catch (error) {
    console.error("DELETE factura error:", error);
    return NextResponse.json({ error: "Error al eliminar factura" }, { status: 500 });
  }
}
