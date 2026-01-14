import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await req.json();

    const {
      cliente_id,
      factura_id,
      metodo,
      monto,
      comprobante = null,
      banco = null,
      lote = null,
      cupon = null,
      tarjeta = null,
      fecha = null, // por si envías fecha personalizada
      observacion = null // importante para registro
    } = data;

    if (!factura_id)
      return NextResponse.json(
        { error: "Falta factura_id" },
        { status: 400 }
      );

    if (!metodo)
      return NextResponse.json(
        { error: "Falta método de pago" },
        { status: 400 }
      );

    if (!monto || Number(monto) <= 0)
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      );

    const conn = await getConnection();

    // 1️⃣ Grabar pago
    const [res] = await conn.execute(
      `
      INSERT INTO pagos (
        cliente_id,
        factura_id,
        metodo,
        monto,
        comprobante,
        banco,
        lote,
        cupon,
        tarjeta,
        fecha,
        observacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cliente_id,
        factura_id,
        metodo,
        monto,
        comprobante,
        banco,
        lote,
        cupon,
        tarjeta,
        fecha ?? new Date().toISOString().slice(0, 10),
        observacion
      ]
    );

    const pagoId = res.insertId;

    // 2️⃣ Aplicar pago (relacionar el pago con la factura)
    await conn.execute(
      `
      INSERT INTO aplicaciones_pagos (
        pago_id,
        factura_id,
        monto_aplicado,
        created_at
      ) VALUES (?, ?, ?, NOW())
      `,
      [pagoId, factura_id, monto]
    );

    // 3️⃣ (Opcional/recomendado) Actualizar saldo y estado de la factura
    // La lógica puede ser:
    // - Sumar todos los monto_aplicado de aplicaciones_pagos y comparar con el total de la factura.
    // - Actualizar campo saldo y estado si quieres hacerlo en esta API.
    // Puedes agregar esta lógica si lo necesitas, o dejarla para el endpoint de la factura.

    return NextResponse.json(
      { message: "Pago registrado y aplicado", pagoId },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /pagos error:", error);
    return NextResponse.json(
      { error: "Error al crear pago" },
      { status: 500 }
    );
  }
}