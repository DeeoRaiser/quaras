import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(req) {
    const conn = await getConnection();

    const { searchParams } = new URL(req.url);

    const cliente_id = searchParams.get("cliente_id");
    const numero = searchParams.get("numero");

    /* =============================
       WHERE DINÁMICO
    ============================= */
    let where = [];
    let params = [];

    if (cliente_id) {
        where.push("p.cliente_id = ?");
        params.push(cliente_id);
    }

    if (numero) {
        where.push("CAST(p.id AS CHAR) LIKE ?");
        params.push(`%${numero}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    /* =============================
       PAGOS
    ============================= */
    const [pagos] = await conn.execute(
        `
        SELECT 
            p.id,
            p.fecha,
            p.monto,
            p.metodo,
            p.cliente_id,
            c.nombre AS cliente
        FROM pagos p
        JOIN clientes c ON c.id = p.cliente_id
        ${whereSQL}
        ORDER BY p.fecha DESC
        `,
        params
    );

    /* =============================
       APLICACIONES
    ============================= */
    for (const pago of pagos) {
        const [apps] = await conn.execute(
            `
            SELECT 
                ap.factura_id,
                ap.monto_aplicado,
                f.numero
            FROM aplicaciones_pagos ap
            JOIN facturas f ON f.id = ap.factura_id
            WHERE ap.pago_id = ?
            `,
            [pago.id]
        );

        pago.aplicaciones = apps;
    }

    return NextResponse.json(pagos);
}
