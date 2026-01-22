import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const {
      puntoVenta,
      numero,
      letra,
      fechaDesde,
      fechaHasta,
      proveedor_id,
      estado = "TODAS"
    } = await req.json();

    /* =========================
       WHERE DINÁMICO
    ========================= */
    const where = {};

    if (puntoVenta) where.punto_vta = puntoVenta;
    if (numero) where.numero = numero;
    if (letra) where.letra = letra;
    if (proveedor_id) where.proveedor_id = proveedor_id;

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde);
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta);
    }
    /* =========================
       FACTURAS + RELACIONES
    ========================= */
    const facturas = await prisma.factura_compras.findMany({
      where,
      orderBy: [
        { fecha: "desc" },
        { id: "desc" }
      ],
      include: {
        proveedores: { // ← nombre exacto de la relación al proveedor
          select: {
            nombre: true,
            razonsocial: true,
            cuit: true
          }
        },
        factura_compra_detalle: true,
        factura_compra_impuestos: true,
        factura_compra_ajustes_pie: true,
        aplicaciones_pagos_compras: {
          include: {
            pagos_compras: { // ← relación exacta hacia los pagos
              select: {
                id: true,
                fecha: true,
                metodo: true
              }
            }
          }
        }
      }
    });


    /* =========================
       ARMAR RESPUESTA FINAL
    ========================= */
    const resultado = facturas.map(fc => {
      const totalFactura = Number(fc.total || 0);

      const totalPagado = fc.aplicaciones_pagos_compras.reduce(
        (acc, p) => acc + Number(p.monto_aplicado || 0),
        0
      );

      const saldo = Math.max(0, +(totalFactura - totalPagado).toFixed(2));

      const estadoCalculado =
        saldo <= 0
          ? "PAGADA"
          : totalPagado > 0
            ? "PARCIAL"
            : "PENDIENTE";

      return {
        id: fc.id,
        punto_vta: fc.punto_vta,
        numero: fc.numero,
        letra: fc.letra,
        fecha: fc.fecha,
        proveedor_id: fc.proveedor_id,
        proveedor_nombre: fc.proveedores?.nombre || null,
        proveedor_cuit: fc.proveedores?.cuit || null,

        detalle: fc.factura_compra_detalle,
        impuestos: fc.factura_compra_impuestos,
        ajustesPie: fc.factura_compra_ajustes_pie,

        pagos: fc.aplicaciones_pagos_compras.map(ap => ({
          id: ap.pagos_compras.id,
          factura_id: ap.factura_id,
          fecha: ap.pagos_compras.fecha,
          metodo: ap.pagos_compras.metodo,
          monto_aplicado: ap.monto_aplicado
        })),

        totalFactura: totalFactura.toFixed(2),
        totalPagado: totalPagado.toFixed(2),
        saldoPendiente: saldo.toFixed(2),
        estado: estadoCalculado
      };
    }).filter(f =>
      estado === "TODAS" || f.estado === estado
    );

    return NextResponse.json(resultado);

  } catch (error) {
    console.error("POST /facturas-compras/list error:", error);
    return NextResponse.json(
      { error: "Error al obtener facturas de compras" },
      { status: 500 }
    );
  }
}
