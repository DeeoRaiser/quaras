import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(request, { params }) {
  const { proveedorId } = await params; // 🔥 ESTA ES LA CLAVE

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const conn = await getConnection();

    const [rows] = await conn.query(
      `
      SELECT 
        pa.id AS proveedor_articulo_id,
        a.id AS articulo_id,
        a.codigo,
        a.descripcion,
        a.iva,
        pa.precio_compra
      FROM proveedor_articulos pa
      JOIN articulos_compras a ON a.id = pa.articulo_id
      WHERE pa.proveedor_id = ?
      ORDER BY a.descripcion
      `,
      [proveedorId]
    );

    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error("Error GET /articulos_compras:", error);
    return NextResponse.json(
      { error: "Error al obtener los artículos del proveedor" },
      { status: 500 }
    );
  }
}
