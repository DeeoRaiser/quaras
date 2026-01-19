import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function DELETE(_, { params }) {
    const pagoId = params.id;
    const conn = await getConnection();
    await conn.beginTransaction();

    try {
        // 1️⃣ Obtener aplicaciones
        const [apps] = await conn.execute(`
            SELECT factura_id, monto_aplicado
            FROM aplicaciones_pagos
            WHERE pago_id = ?
        `, [pagoId]);

        // 2️⃣ Restaurar saldos
        for (const a of apps) {
            await conn.execute(`
                UPDATE facturas_ventas
                SET saldoPendiente = saldoPendiente + ?
                WHERE id = ?
            `, [a.monto_aplicado, a.factura_id]);
        }

        // 3️⃣ Eliminar aplicaciones
        await conn.execute(
            `DELETE FROM aplicaciones_pagos WHERE pago_id = ?`,
            [pagoId]
        );

        // 4️⃣ Eliminar pago
        await conn.execute(
            `DELETE FROM pagos WHERE id = ?`,
            [pagoId]
        );

        await conn.commit();
        return NextResponse.json({ ok: true });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        return NextResponse.json(
            { error: "Error al eliminar pago" },
            { status: 500 }
        );
    }
}
