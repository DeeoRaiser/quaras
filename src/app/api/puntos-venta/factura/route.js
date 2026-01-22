import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    // filtros opcionales
    const tipo = searchParams.get("tipo");        // 'FACTURA' | 'NC'
    const activoParam = searchParams.get("activo"); // '1' | '0'

    /* =============================
       WHERE DINÁMICO
    ============================= */
    const where = {
      usuario_id: userId
    };

    if (tipo) {
      where.tipo_comprobante = tipo;
    }

    if (activoParam !== null) {
      where.activo = Boolean(Number(activoParam));
    }

    /* =============================
       QUERY
    ============================= */
    const puntosVenta = await prisma.puntos_venta.findMany({
      where,
      select: {
        id: true,
        usuario_id: true,
        nombre: true,
        punto_venta: true,
        numero: true,
        tipo_comprobante: true,
        letra: true,
        activo: true
      },
      orderBy: [
        { punto_venta: "asc" },
        { letra: "asc" }
      ]
    });

    return NextResponse.json(puntosVenta, { status: 200 });

  } catch (err) {
    console.error("GET /puntos-venta error:", err);
    return NextResponse.json(
      { error: "Error al obtener puntos de venta" },
      { status: 500 }
    );
  }
}
