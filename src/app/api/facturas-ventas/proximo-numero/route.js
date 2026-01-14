import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db"; 

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const punto = searchParams.get("punto");
  const letra = searchParams.get("letra");

  if (!punto || !letra)
    return NextResponse.json({ error: "Datos faltantes" }, { status: 400 });

  const conn = await getConnection();

  const [rows] = await conn.query(
    "SELECT id, numero FROM puntos_venta WHERE punto_venta = ? AND letra = ? LIMIT 1",
    [punto, letra]
  );

  if (rows.length === 0)
    return NextResponse.json({ error: "Punto de venta no encontrado" }, { status: 404 });

  const pv = rows[0];

  const proximo = pv.numero + 1;

  return NextResponse.json({ numero: proximo, puntoVentaId: pv.id });
}
