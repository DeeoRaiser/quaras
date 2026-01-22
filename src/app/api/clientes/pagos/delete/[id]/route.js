import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function DELETE(_, { params }) {
  const pagoId = Number(params.id);

  try {
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Obtener aplicaciones del pago
      const aplicaciones = await tx.aplicaciones_pagos.findMany({
        where: { pago_id: pagoId },
        select: {
          factura_id: true,
          monto_aplicado: true
        }
      });

      // 2️⃣ Restaurar saldos de facturas
      for (const a of aplicaciones) {
        await tx.facturas_ventas.update({
          where: { id: a.factura_id },
          data: {
            saldoPendiente: {
              increment: a.monto_aplicado
            }
          }
        });
      }

      // 3️⃣ Eliminar aplicaciones
      await tx.aplicaciones_pagos.deleteMany({
        where: { pago_id: pagoId }
      });

      // 4️⃣ Eliminar pago
      await tx.pagos.delete({
        where: { id: pagoId }
      });
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Error DELETE /pagos:", error);
    return NextResponse.json(
      { error: "Error al eliminar pago" },
      { status: 500 }
    );
  }
}
