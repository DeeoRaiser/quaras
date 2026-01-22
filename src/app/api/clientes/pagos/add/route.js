import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const data = await req.json();


  const {
    cliente_id,
    metodo,
    monto,
    fecha,
    observacion,
    comprobante,
    cuenta_bancaria_id,
    aplicaciones,
    banco
  } = data


  console.log("data")
  console.log(data)



  if (!cliente_id) {
    return NextResponse.json({ error: "Cliente requerido" }, { status: 400 });
  }

  if (!Array.isArray(aplicaciones) || aplicaciones.length === 0) {
    return NextResponse.json({ error: "Sin aplicaciones" }, { status: 400 });
  }

  const totalAplicado = aplicaciones.reduce(
    (sum, a) => sum + Number(a.monto || 0),
    0
  );

  if (totalAplicado > Number(monto)) {
    return NextResponse.json(
      { error: "El total aplicado supera el monto del pago" },
      { status: 400 }
    );
  }

/*   if (metodo !== "EFECTIVO" && !cuenta_bancaria_id) {
    return NextResponse.json(
      { error: "Cuenta bancaria requerida" },
      { status: 400 }
    );
  } */

  function formatearFacturas(facturas) {
    return facturas
      .map(
        (f) =>
          `${String(f.punto_vta).padStart(4, "0")}-${String(f.numero).padStart(
            6,
            "0"
          )}-${f.letra}`
      )
      .join(", ");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Crear pago
      const pago = await tx.pagos.create({
        data: {
          cliente_id,
          metodo,
          monto: Number(monto),
          fecha: fecha ? new Date(fecha) : new Date(),
          observacion: observacion ?? null,
          comprobante: comprobante ?? null,
          metodo: metodo,
          banco_id:banco
        },
      });

      // 2️⃣ Movimiento bancario (CRÉDITO)
      if (metodo === "TRANSFERENCIA") {
        await tx.movimientos_bancarios.create({
          data: {
            banco_id: cuenta_bancaria_id,
            fecha: fecha ? new Date(fecha) : new Date(),
            tipo: "INGRESO",
            monto: Number(monto),
            descripcion: `Pago factura ${formatearFacturas(
              aplicaciones
            )} Numero Comprobante ${comprobante} (Pago #${pago.id})`,
            user_id: session.user?.id,
          },
        });
      }

      // 3️⃣ Aplicar a facturas
      for (const a of aplicaciones) {
        await tx.aplicaciones_pagos.create({
          data: {
            pago_id: pago.id,
            factura_id: a.factura_id,
            monto_aplicado: Number(a.monto),
          },
        });
      }

      return pago;
    });

    return NextResponse.json({ pagoId: result.id }, { status: 201 });
  } catch (error) {
    console.error("POST /pagos error:", error);
    return NextResponse.json(
      { error: "Error al registrar pago" },
      { status: 500 }
    );
  }
}
