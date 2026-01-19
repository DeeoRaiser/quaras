import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const {
    cliente_id,
    metodo,
    monto,
    fecha,
    observacion,
    comprobante,
    cuenta_bancaria_id,
    aplicaciones
  } = await req.json();

  console.log(aplicaciones)

  if (!cliente_id)
    return NextResponse.json({ error: "Cliente requerido" }, { status: 400 });

  if (!Array.isArray(aplicaciones) || aplicaciones.length === 0)
    return NextResponse.json({ error: "Sin aplicaciones" }, { status: 400 });

  const totalAplicado = aplicaciones.reduce(
    (sum, a) => sum + Number(a.monto || 0),
    0
  );

  if (totalAplicado > Number(monto))
    return NextResponse.json(
      { error: "El total aplicado supera el monto del pago" },
      { status: 400 }
    );

  if (metodo !== "EFECTIVO" && !cuenta_bancaria_id) {
    return NextResponse.json(
      { error: "Cuenta bancaria requerida" },
      { status: 400 }
    );
  }

  const conn = await getConnection();
  await conn.beginTransaction();

  try {
    // 1️⃣ Crear pago
    const [res] = await conn.execute(
      `
      INSERT INTO pagos (
        cliente_id,
        metodo,
        monto,
        fecha,
        observacion,
        comprobante,
        banco
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cliente_id,
        metodo,
        monto,
        fecha ?? new Date().toISOString().slice(0, 10),
        observacion ?? null,
        comprobante ?? null,
        metodo !== "EFECTIVO" ? cuenta_bancaria_id : null
      ]
    );

    const pagoId = res.insertId;

    function formatearFacturas(facturas) {
  return facturas
    .map(f =>
      `${String(f.punto_vta).padStart(4, "0")}-${String(f.numero).padStart(6, "0")}-${f.letra}`
    )
    .join(", ");
}

    // 2️⃣ Movimiento bancario (CRÉDITO)
    if (metodo !== "EFECTIVO") {
      await conn.execute(
        `
        INSERT INTO movimientos_bancarios (
          banco_id,
          fecha,
          tipo,
          monto,
          descripcion,
          user_id
        ) VALUES (?, ?, 'CREDITO', ?, ?, ?)
        `,
        [
          cuenta_bancaria_id,
          fecha ?? new Date().toISOString().slice(0, 10),
          monto,
          `Pago factura ${formatearFacturas(aplicaciones)} Numero Comprobante ${comprobante} (Pago #${pagoId})`,
          session.user?.id
        ]
      );
    }

    // 3️⃣ Aplicar a facturas
    for (const a of aplicaciones) {
      await conn.execute(
        `
        INSERT INTO aplicaciones_pagos
        (pago_id, factura_id, monto_aplicado)
        VALUES (?, ?, ?)
        `,
        [pagoId, a.factura_id, a.monto]
      );
    }

    await conn.commit();
    return NextResponse.json({ pagoId }, { status: 201 });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    return NextResponse.json(
      { error: "Error al registrar pago" },
      { status: 500 }
    );
  }
}
