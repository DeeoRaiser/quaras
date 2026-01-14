import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function POST(req) {
  try {
    const data = await req.json();

    console.log(data)

    const { banco_id, fecha_movimiento, tipo, importe, descripcion, concepto_id, usuario_id } = data;

    const conn = await getConnection();
    const query = `
      INSERT INTO movimientos_bancarios (banco_id, fecha_movimiento, tipo, importe, descripcion, concepto_id, usuario_id )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await conn.execute(query, [banco_id, fecha_movimiento, tipo, importe, descripcion, concepto_id, usuario_id]);

    return NextResponse.json({ message: "Banco creado correctamente" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear banco" }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const banco_id = searchParams.get("banco_id");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    if (!banco_id || !desde || !hasta) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const connection = await getConnection();

    // 1️⃣ Calcular saldo hasta el día anterior
    const [saldoRows] = await connection.execute(
      `
SELECT COALESCE(SUM(CASE WHEN tipo = 'INGRESO' THEN monto WHEN tipo = 'EGRESO' THEN -monto END), 0) AS saldoAnterior FROM movimientos_bancarios WHERE banco_id = ? AND fecha < ?;
      `,
      [banco_id, desde]
    );

    const saldoAnterior = saldoRows[0].saldoAnterior || 0;

    // 2️⃣ Traer movimientos entre fechas
    const [movimientos] = await connection.execute(
      `
      SELECT 
    mb.id,
    mb.banco_id,
    mb.fecha,
    mb.tipo,
    mb.monto,
    mb.descripcion,
    u.usuario
FROM movimientos_bancarios AS mb
INNER JOIN usuarios AS u 
    ON mb.user_id = u.id
WHERE mb.banco_id = ?
  AND mb.fecha BETWEEN ? AND ?  
ORDER BY mb.fecha ASC;

      `,
      [banco_id, desde, hasta]
    );

    return NextResponse.json({ saldoAnterior, movimientos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
