import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { getConnection } from "@/lib/db";

// Crear cupón
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await req.json();
    const {
      tarjeta_id,
      fecha,
      monto_total,
      nro_cupon,
      nro_lote,
      banco_id,
      fecha_acreditacion
    } = data;

    const conn = await getConnection();

    // Obtener comisiones de la tarjeta
    const [tarjeta] = await conn.query(
      "SELECT comision_porcentaje, comision_fija FROM tarjetas_credito WHERE id = ?",
      [tarjeta_id]
    );

    if (!tarjeta.length)
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

    const { comision_porcentaje, comision_fija } = tarjeta[0];

    const comision =
      (monto_total * (comision_porcentaje / 100)) + comision_fija;

    const acreditado = monto_total - comision;

    const query = `
      INSERT INTO cupones_tarjeta (
        tarjeta_id, fecha, monto_total,
        nro_cupon, nro_lote,
        comision_porcentaje, comision_fija, comision_final,
        monto_acreditado, fecha_acreditacion,
        banco_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await conn.execute(query, [
      tarjeta_id,
      fecha,
      monto_total,
      nro_cupon || null,
      nro_lote || null,
      comision_porcentaje,
      comision_fija,
      comision,
      acreditado,
      fecha_acreditacion || null,
      banco_id || null
    ]);

    return NextResponse.json(
      { message: "Cupón registrado correctamente" },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST cupon:", error);
    return NextResponse.json({ error: "Error al registrar cupón" }, { status: 500 });
  }
}

// Listar cupones
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const conn = await getConnection();
    const [rows] = await conn.query(`
      SELECT c.*, t.nombre AS tarjeta, b.nombre AS banco
      FROM cupones_tarjeta c
      LEFT JOIN tarjetas_credito t ON c.tarjeta_id = t.id
      LEFT JOIN bancos b ON c.banco_id = b.id
      ORDER BY fecha DESC, id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET cupones:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
