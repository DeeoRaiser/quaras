import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const facturaId = Number(params.id);

    const {
      cliente_id = null,
      fecha = null,
      forma_pago = null,
      monto = 0,
      observacion = null,
    } = await req.json();

    if (!monto || Number(monto) <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    /* ==========================================
       1️⃣ CREAR PAGO
    ========================================== */
    const pago = await prisma.pagos.create({
      data: {
        cliente_id,
        fecha: fecha ? new Date(fecha) : new Date(),
        forma_pago,
        total: Number(monto),
        observacion,
      },
    });

    /* ==========================================
       2️⃣ APLICAR PAGO A FACTURA
    ========================================== */
    await prisma.aplicaciones_pagos.create({
      data: {
        pago_id: pago.id,
        factura_id: facturaId,
        monto_aplicado: Number(monto),
      },
    });

    /* ==========================================
       3️⃣ RECALCULAR TOTAL FACTURA
    ========================================== */
    const totalFacturaAgg = await prisma.factura_detalle.aggregate({
      where: { factura_id: facturaId },
      _sum: { subtotal: true },
    });

    const totalFactura = Number(totalFacturaAgg._sum.subtotal || 0);

    /* ==========================================
       4️⃣ RECALCULAR TOTAL APLICADO
    ========================================== */
    const totalAplicadoAgg = await prisma.aplicaciones_pagos.aggregate({
      where: { factura_id: facturaId },
      _sum: { monto_aplicado: true },
    });

    const totalAplicado = Number(totalAplicadoAgg._sum.monto_aplicado || 0);

    /* ==========================================
       5️⃣ CALCULAR NUEVO ESTADO
    ========================================== */
    let nuevoEstado = "PENDIENTE";
    if (totalAplicado >= totalFactura && totalFactura > 0) {
      nuevoEstado = "PAGADA";
    } else if (totalAplicado > 0) {
      nuevoEstado = "PARCIAL";
    }

    /* ==========================================
       6️⃣ ACTUALIZAR FACTURA
    ========================================== */
    await prisma.facturas.update({
      where: { id: facturaId },
      data: { estado: nuevoEstado },
    });

    return NextResponse.json({
      message: "Pago aplicado",
      pagoId: pago.id,
      nuevoEstado,
    });
  } catch (error) {
    console.error("POST aplicar-pago error:", error);
    return NextResponse.json(
      { error: "Error al aplicar pago" },
      { status: 500 }
    );
  }
}
