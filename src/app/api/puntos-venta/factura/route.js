import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { getConnection } from "@/lib/db";


export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    // opcionales
    const tipo = searchParams.get("tipo");      // 'FACTURA' o 'NC' (opcional)
    const activoParam = searchParams.get("activo"); // '1' or '0' (opcional)

    // build query dinámico con params seguros
    let sql = `SELECT id, usuario_id, nombre, punto_venta, numero, tipo_comprobante, letra, activo
               FROM puntos_venta
               WHERE usuario_id = ?`;
    const params = [userId];

    if (tipo) {
      sql += ` AND tipo_comprobante = ?`;
      params.push(tipo);
    }

    if (activoParam !== null) {
      sql += ` AND activo = ?`;
      params.push(Number(activoParam) ? 1 : 0);
    }

    // ordenar por punto_venta y letra para que el frontend lo recorra fácil
    sql += ` ORDER BY punto_venta, letra`;

    const conn = await getConnection();
    const [rows] = await conn.query(sql, params);

    // devolvemos todas las filas tal cual (cada combinación punto_venta + letra estará)
    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("GET /puntos-venta error:", err);
    return NextResponse.json({ error: "Error al obtener puntos de venta" }, { status: 500 });
  }
}

