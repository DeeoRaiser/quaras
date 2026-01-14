import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

export async function POST(req, { params }) {
  const conn = await getConnection();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: facturaId } = await params;

    const {
      proveedor_id,
      fecha,
      metodo,
      banco = null,
      lote = null,
      cupon = null,
      tarjeta = null,
      monto,
      observacion = null,
      comprobante = null
    } = await req.json();

    if (!monto || Number(monto) <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    await conn.beginTransaction();

    // 1️⃣ Crear pago de compra
    const [pagoRes] = await conn.execute(
      `INSERT INTO pagos_compras 
        (proveedor_id, factura_id, fecha, monto, metodo, banco, lote, cupon, tarjeta, observacion, comprobante)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        proveedor_id,
        facturaId,
        fecha || new Date(),
        monto,
        metodo,
        banco,
        lote,
        cupon,
        tarjeta,
        observacion,
        comprobante
      ]
    );

    const pagoId = pagoRes.insertId;

    // 2️⃣ Aplicar pago
    await conn.execute(
      `INSERT INTO aplicaciones_pagos_compras 
        (pago_id, factura_id, monto_aplicado)
       VALUES (?, ?, ?)`,
      [pagoId, facturaId, monto]
    );

    // 3️⃣ Total factura
    const [[{ total_factura }]] = await conn.query(
      `SELECT COALESCE(SUM(subtotal),0) AS total_factura
       FROM factura_compra_detalle
       WHERE factura_id = ?`,
      [facturaId]
    );

    // 4️⃣ Total aplicado
    const [[{ total_aplicado }]] = await conn.query(
      `SELECT COALESCE(SUM(monto_aplicado),0) AS total_aplicado
       FROM aplicaciones_pagos_compras
       WHERE factura_id = ?`,
      [facturaId]
    );

    let estado = "PENDIENTE";
    if (total_aplicado >= total_factura && total_factura > 0) {
      estado = "PAGADA";
    } else if (total_aplicado > 0) {
      estado = "PARCIAL";
    }

    const saldo = Number(total_factura) - Number(total_aplicado);

    // 5️⃣ Actualizar factura
    await conn.execute(
      `UPDATE factura_compras 
       SET estado = ?, saldo = ?
       WHERE id = ?`,
      [estado, saldo, facturaId]
    );

    await conn.commit();

    return NextResponse.json({
      message: "Pago aplicado correctamente",
      pagoId,
      estado,
      saldo
    });

  } catch (error) {
    await conn.rollback();
    console.error("POST aplicar-pago compras error:", error);
    return NextResponse.json(
      { error: "Error al aplicar pago" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
