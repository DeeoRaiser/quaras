import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const punto = searchParams.get("punto");
    const letra = searchParams.get("letra");

    if (!punto || !letra) {
      return NextResponse.json(
        { error: "Datos faltantes" },
        { status: 400 }
      );
    }

    const puntoVenta = Number(punto);

    if (isNaN(puntoVenta)) {
      return NextResponse.json(
        { error: "Punto de venta inválido" },
        { status: 400 }
      );
    }

    const pv = await prisma.puntos_venta.findFirst({
      where: {
        punto_venta: puntoVenta, // ✅ ahora es Int
        letra: letra,
      },
      select: {
        id: true,
        numero: true,
      },
    });

    if (!pv) {
      return NextResponse.json(
        { error: "Punto de venta no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      numero: pv.numero + 1,
      puntoVentaId: pv.id,
    });
  } catch (error) {
    console.error("GET punto de venta error:", error);
    return NextResponse.json(
      { error: "Error al obtener punto de venta" },
      { status: 500 }
    );
  }
}
