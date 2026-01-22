import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();

    const {
      puntoVenta,
      numero,
      letra,
      fechaDesde,
      fechaHasta,
      cliente_id,
      estado = "TODAS",
    } = body || {};

    /* ==========================================
       1️⃣ ARMAR WHERE DINÁMICO
    ========================================== */
    const where = {};

    if (puntoVenta) where.punto_vta = puntoVenta;
    if (numero) where.numero = numero;
    if (letra) where.letra = letra;
    if (cliente_id) where.cliente_id = cliente_id;
    if (estado !== "TODAS") where.estado = estado;

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
    }

    /* ==========================================
       2️⃣ FACTURAS + CLIENTE + PAGOS
    ========================================== */
    const facturas = await prisma.facturas.findMany({
      where,
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
            pagos: {
              select: {
                id: true,
                fecha: true,
                metodo: true,
              },
            },
          },
        },
      },
      orderBy: [
        { fecha: "desc" },
        { id: "desc" },
      ],
    });

    if (facturas.length === 0) {
      return NextResponse.json([]);
    }

    const ids = facturas.map(f => f.id);

    /* ==========================================
       3️⃣ DETALLE
    ========================================== */
    const detalle = await prisma.factura_detalle.findMany({
      where: { factura_id: { in: ids } },
      orderBy: { id: "asc" },
    });

    /* ==========================================
       4️⃣ IMPUESTOS
    ========================================== */
    const impuestos = await prisma.factura_venta_impuestos.findMany({
      where: { factura_id: { in: ids } },
      orderBy: { id: "asc" },
    });

    /* ==========================================
       5️⃣ AJUSTES PIE
    ========================================== */
    const ajustesPie = await prisma.factura_ajustes_pie.findMany({
      where: { factura_id: { in: ids } },
      orderBy: { id: "asc" },
    });

    /* ==========================================
       6️⃣ ARMAR RESPUESTA FINAL
    ========================================== */
    const resultado = facturas.map((f) => {
      const totalFactura = Number(f.total || 0);

      const totalPagado = f.aplicaciones_pagos.reduce(
        (acc, p) => acc + Number(p.monto_aplicado),
        0
      );

      const saldo = Math.max(0, +(totalFactura - totalPagado).toFixed(2));

      return {
        id: f.id,
        punto_vta: f.punto_vta,
        numero: f.numero,
        letra: f.letra,
        fecha: f.fecha,
        cliente_id: f.cliente_id,
        cliente_nombre: f.clientes?.nombre || "",
        cliente_dni: f.clientes?.dni || "",
        detalle: detalle.filter(d => d.factura_id === f.id),
        impuestos: impuestos.filter(i => i.factura_id === f.id),
        ajustesPie: ajustesPie.filter(a => a.factura_id === f.id),
        pagos: f.aplicaciones_pagos.map(p => ({
          id: p.pagos.id,
          factura_id: f.id,
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
      };
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("POST /api/facturas-venta/list error:", error);
    return NextResponse.json(
      { error: "Error al obtener facturas" },
      { status: 500 }
    );
  }
}
