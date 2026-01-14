import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT 
        a.id,
        a.descripcion,
        a.precio,
        a.iva_id,
        i.porcentaje AS iva,
        a.descuentos,
        a.precio_neto,
        a.utilidad,
        a.precio_venta,
        a.maneja_stock,
        a.nota,
        a.familia_id,
        a.categoria_id,
        a.clasificacion_id,
        a.codigo,
         a.centro_costo_id
      FROM articulos a
      LEFT JOIN iva i ON i.id = a.iva_id
      ORDER BY a.id DESC
    `);

    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error("Error GET /articulos:", error);
    return NextResponse.json(
      { error: "Error al obtener los articulos" },
      { status: 500 }
    );
  }
}
