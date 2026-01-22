import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const facturaId = Number(params.id);

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

    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Crear pago de compra
      const pago = await tx.pagos_compras.create({
        data: {
          proveedor_id: Number(proveedor_id),
          factura_id: facturaId,
          fecha: fecha ? new Date(fecha) : new Date(),
          monto: Number(monto),
          metodo,
          banco,
          lote,
          cupon,
          tarjeta,
          observacion,
          comprobante
        }
      });

      // 2️⃣ Aplicar pago
      await tx.aplicaciones_pagos_compras.create({
        data: {
          pago_id: pago.id,
          factura_id: facturaId,
          monto_aplicado: Number(monto)
        }
      });

      // 3️⃣ Total factura
      const totalFactura = await tx.factura_compra_detalle.aggregate({
        where: { factura_id: facturaId },
        _sum: { subtotal: true }
      });

      const total_factura = totalFactura._sum.subtotal || 0;

      // 4️⃣ Total aplicado
      const totalAplicado = await tx.aplicaciones_pagos_compras.aggregate({
        where: { factura_id: facturaId },
        _sum: { monto_aplicado: true }
      });

      const total_aplicado = totalAplicado._sum.monto_aplicado || 0;

      // 5️⃣ Calcular estado y saldo
      let estado = "PENDIENTE";
      if (total_aplicado >= total_factura && total_factura > 0) {
        estado = "PAGADA";
      } else if (total_aplicado > 0) {
        estado = "PARCIAL";
      }

      const saldo = Number(total_factura) - Number(total_aplicado);

      // 6️⃣ Actualizar factura
      await tx.factura_compras.update({
        where: { id: facturaId },
        data: {
          estado,
          saldo
        }
      });

      return {
        pagoId: pago.id,
        estado,
        saldo
      };
    });

    return NextResponse.json({
      message: "Pago aplicado correctamente",
      ...result
    });

  } catch (error) {
    console.error("POST aplicar-pago compras error:", error);
    return NextResponse.json(
      { error: "Error al aplicar pago" },
      { status: 500 }
    );
  }
}
