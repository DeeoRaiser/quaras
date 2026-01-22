import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const facturaId = Number(params.id);

    /* =============================
       1️⃣ FACTURA + CLIENTE
    ============================= */
    const factura = await prisma.facturas.findUnique({
      where: { id: facturaId },
      include: {
        clientes: {
          select: {
            nombre: true,
            dni: true,
          },
        },
        aplicaciones_pagos: {
          select: {
            monto_aplicado: true,
          },
        },
      },
    });

    if (!factura) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const totalPagado = factura.aplicaciones_pagos.reduce(
      (acc, p) => acc + Number(p.monto_aplicado),
      0
    );

    /* =============================
       2️⃣ DETALLE
    ============================= */
    const detalle = await prisma.factura_detalle.findMany({
      where: { factura_id: facturaId },
      orderBy: { id: "asc" },
    });

    /* =============================
       3️⃣ IMPUESTOS
    ============================= */
    const impuestos = await prisma.factura_venta_impuestos.findMany({
      where: { factura_id: facturaId },
      orderBy: { id: "asc" },
    });

    /* =============================
       4️⃣ AJUSTES PIE
    ============================= */
    const ajustesPie = await prisma.factura_ajustes_pie.findMany({
      where: { factura_id: facturaId },
      orderBy: { id: "asc" },
    });

    /* =============================
       5️⃣ PAGOS APLICADOS
    ============================= */
    const pagos = await prisma.aplicaciones_pagos.findMany({
      where: { factura_id: facturaId },
      include: {
        pagos: {
          select: {
            id: true,
            fecha: true,
            metodo: true,
          },
        },
      },
      orderBy: [
        { pagos: { fecha: "asc" } },
        { id: "asc" },
      ],
    });

    /* =============================
       6️⃣ CÁLCULOS
    ============================= */
    const totalFactura = Number(factura.total || 0);
    const saldo = Math.max(0, +(totalFactura - totalPagado).toFixed(2));

    /* =============================
       7️⃣ RESPUESTA FINAL
    ============================= */
    return NextResponse.json({
      id: factura.id,
      punto_vta: factura.punto_vta,
      numero: factura.numero,
      letra: factura.letra,
      fecha: factura.fecha,
      cliente_id: factura.cliente_id,
      cliente_nombre: factura.clientes?.nombre || "",
      cliente_dni: factura.clientes?.dni || "",
      detalle,
      impuestos,
      ajustesPie,
      pagos: pagos.map(p => ({
        id: p.pagos.id,
        factura_id: facturaId,
        fecha: p.pagos.fecha,
        metodo: p.pagos.metodo,
        monto_aplicado: p.monto_aplicado,
      })),
      totalFactura: totalFactura.toFixed(2),
      totalPagado: totalPagado.toFixed(2),
      saldoPendiente: saldo.toFixed(2),
      estado:
        saldo <= 0
          ? "PAGADA"
          : totalPagado > 0
          ? "PARCIAL"
          : "PENDIENTE",
    });
  } catch (error) {
    console.error("GET factura error:", error);
    return NextResponse.json(
      { error: "Error al obtener factura" },
      { status: 500 }
    );
  }
}


export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const facturaId = Number(params.id);
    const { fecha, numero, letra, punto_vta, observacion } = await req.json();

    await prisma.facturas.update({
      where: { id: facturaId },
      data: {
        fecha: fecha ? new Date(fecha) : null,
        numero,
        letra,
        punto_vta,
        observacion,
      },
    });

    return NextResponse.json({
      message: "Factura actualizada correctamente",
    });
  } catch (error) {
    console.error("PUT factura error:", error);
    return NextResponse.json(
      { error: "Error al actualizar factura" },
      { status: 500 }
    );
  }
}


export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const facturaId = Number(params.id);

    await prisma.facturas.delete({
      where: { id: facturaId },
    });

    return NextResponse.json({ message: "Factura eliminada" });
  } catch (error) {
    console.error("DELETE factura error:", error);
    return NextResponse.json(
      { error: "Error al eliminar factura" },
      { status: 500 }
    );
  }
}
