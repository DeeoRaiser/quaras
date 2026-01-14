import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

     const { id: facturaId } = await params;
    const { cliente_id = null, fecha = null, forma_pago = null, monto = 0, observacion = null } = await req.json();

    if (!monto || Number(monto) <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const conn = await getConnection();

    // crear pago
    const [pRes] = await conn.execute(
      `INSERT INTO pagos (cliente_id, fecha, forma_pago, total, observacion) VALUES (?, ?, ?, ?, ?)`,
      [cliente_id, fecha || new Date().toISOString().slice(0,10), forma_pago, monto, observacion]
    );
    const pagoId = pRes.insertId;

    // aplicar pago a factura
    await conn.execute(
      `INSERT INTO aplicaciones_pagos (pago_id, factura_id, monto_aplicado) VALUES (?, ?, ?)`,
      [pagoId, facturaId, monto]
    );

    // recalcular sumas y estado factura
    const [sumSub] = await conn.query("SELECT COALESCE(SUM(subtotal),0) AS total_factura FROM factura_detalle WHERE factura_id = ?", [facturaId]);
    const totalFactura = Number(sumSub[0].total_factura);

    const [sumApps] = await conn.query("SELECT COALESCE(SUM(monto_aplicado),0) AS total_aplicado FROM aplicaciones_pagos WHERE factura_id = ?", [facturaId]);
    const totalAplicado = Number(sumApps[0].total_aplicado);

    let nuevoEstado = "PENDIENTE";
    if (totalAplicado <= 0) nuevoEstado = "PENDIENTE";
    else if (totalAplicado >= totalFactura) nuevoEstado = "PAGADA";
    else nuevoEstado = "PARCIAL";

    await conn.execute("UPDATE facturas SET estado = ? WHERE id = ?", [nuevoEstado, facturaId]);

    return NextResponse.json({ message: "Pago aplicado", pagoId, nuevoEstado });
  } catch (error) {
    console.error("POST aplicar-pago error:", error);
    return NextResponse.json({ error: "Error al aplicar pago" }, { status: 500 });
  }
}
