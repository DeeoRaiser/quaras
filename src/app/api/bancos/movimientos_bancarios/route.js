import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================
// POST → CREAR MOVIMIENTO
// ==========================
export async function POST(req) {
  try {
    const data = await req.json();

    const {
      banco_id,
      fecha,
      tipo,
      monto,
      descripcion,
      concepto_id,
      usuario_id
    } = data;

    await prisma.movimientos_bancarios.create({
      data: {
        banco_id: Number(banco_id),
        fecha_: new Date(fecha),
        tipo,
        monto: Number(monto),
        descripcion,
        concepto_id: concepto_id || null,
        usuario_id: Number(usuario_id)
      }
    });

    return NextResponse.json(
      { message: "Movimiento creado correctamente" },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST movimientos_bancarios error:", error);

    return NextResponse.json(
      { error: "Error al crear movimiento" },
      { status: 500 }
    );
  }
}

// ==========================
// GET → LISTAR MOVIMIENTOS + SALDO
// ==========================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const banco_id = Number(searchParams.get("banco_id"));
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    if (!banco_id || !desde || !hasta) {
      return NextResponse.json(
        { error: "Faltan parámetros" },
        { status: 400 }
      );
    }

    // 1️⃣ Saldo anterior
    const saldoAgg = await prisma.movimientos_bancarios.aggregate({
      where: {
        banco_id,
        fecha: {
          lt: new Date(desde)
        }
      },
      _sum: {
        monto: true
      }
    });

    const ingresos = await prisma.movimientos_bancarios.aggregate({
      where: {
        banco_id,
        tipo: "INGRESO",
        fecha: {
          lt: new Date(desde)
        }
      },
      _sum: {
        monto: true
      }
    });

    const egresos = await prisma.movimientos_bancarios.aggregate({
      where: {
        banco_id,
        tipo: "EGRESO",
        fecha: {
          lt: new Date(desde)
        }
      },
      _sum: {
        monto: true
      }
    });

    const saldoAnterior =
      (ingresos._sum.monto || 0) -
      (egresos._sum.monto || 0);

    // 2️⃣ Movimientos entre fechas
    const movimientos = await prisma.movimientos_bancarios.findMany({
      where: {
        banco_id,
        fecha: {
          gte: new Date(desde),
          lte: new Date(hasta)
        }
      },
      include: {
        usuarios: {
          select: {
            usuario: true
          }
        }
      },
      orderBy: {
        fecha: "asc"
      }
    });

    // Normalizar respuesta (como tu SQL)
    const movimientosFormateados = movimientos.map(m => ({
      id: m.id,
      banco_id: m.banco_id,
      fecha: m.fecha,
      tipo: m.tipo,
      monto: m.monto,
      descripcion: m.descripcion,
      usuario: m.usuarios?.usuario || null
    }));

    return NextResponse.json({
      saldoAnterior,
      movimientos: movimientosFormateados
    });

  } catch (error) {
    console.error("GET movimientos_bancarios error:", error);

    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
