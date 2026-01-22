import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* =========================
   OBTENER FACTURA COMPRA
========================= */
export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // ✅ Next.js 14+: params es una promesa
    const params = await context.params;
    const facturaId = Number(params.id);

    const factura = await prisma.factura_compras.findUnique({
      where: { id: facturaId },
      include: {
        proveedores: { select: { nombre: true, cuit: true } },
        factura_compra_detalle: {
          include: {
            articulos_compras: { select: { codigo: true, descripcion: true } },
          },
          orderBy: { id: "asc" }
        },
        aplicaciones_pagos_compras: {
          include: { pagos_compras: true }, // ✅ nombre correcto de la relación
          orderBy: [{ pago_id: "asc" }]
        },
        factura_compra_impuestos: true,
        factura_compra_ajustes_pie: true
      }
    });

    if (!factura) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      ...factura,
      proveedor_nombre: factura.proveedores?.nombre || null,
      proveedor_cuit: factura.proveedores?.cuit || null,
      detalle: factura.factura_compra_detalle.map(d => ({
        ...d,
        articulo_codigo: d.articulos_compras?.codigo || null
      })),
      pagos: factura.aplicaciones_pagos_compras.map(p => ({
        ...p.pagos_compras, // ✅ accedemos a la relación correcta
        monto_aplicado: p.monto_aplicado
      }))
    });

  } catch (error) {
    console.error("GET factura compra error:", error);
    return NextResponse.json({ error: "Error al obtener factura" }, { status: 500 });
  }
}

/* =========================
   EDITAR CABECERA
========================= */
export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const params = await context.params;
    const facturaId = Number(params.id);

    const { fecha, numero, letra, punto_vta, observacion } = await req.json();

    await prisma.factura_compras.update({
      where: { id: facturaId },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        numero: numero ?? undefined,
        letra: letra ?? undefined,
        punto_vta: punto_vta ?? undefined,
        observacion: observacion ?? undefined
      }
    });

    return NextResponse.json({ message: "Factura actualizada correctamente" });

  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    console.error("PUT factura compra error:", error);
    return NextResponse.json({ error: "Error al actualizar factura" }, { status: 500 });
  }
}

/* =========================
   ELIMINAR FACTURA
========================= */
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const params = await context.params;
    const facturaId = Number(params.id);

    await prisma.$transaction(async (tx) => {
      await tx.aplicaciones_pagos_compras.deleteMany({ where: { factura_id: facturaId } });
      await tx.pagos_compras.deleteMany({ where: { factura_id: facturaId } });
      await tx.factura_compra_detalle.deleteMany({ where: { factura_id: facturaId } });
      await tx.factura_compras.delete({ where: { id: facturaId } });
    });

    return NextResponse.json({ message: "Factura eliminada correctamente" });

  } catch (error) {
    console.error("DELETE factura compra error:", error);
    return NextResponse.json({ error: "Error al eliminar factura" }, { status: 500 });
  }
}
