import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* =========================
   AGREGAR DETALLE
========================= */
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const facturaId = Number(params.id);

    const {
      articulo_id = null,
      descripcion,
      cantidad = 1,
      precio_compra = 0,
      iva = 0,
      ajuste = 0
    } = await req.json();

    const subtotal =
      Number(cantidad) * Number(precio_compra) +
      Number(ajuste) +
      Number(iva);

    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Crear detalle
      await tx.factura_compra_detalle.create({
        data: {
          factura_id: facturaId,
          articulo_id: articulo_id ? Number(articulo_id) : null,
          descripcion,
          cantidad: Number(cantidad),
          precio_compra: Number(precio_compra),
          iva: Number(iva),
          ajuste: Number(ajuste),
          subtotal: Number(subtotal)
        }
      });

      // 2️⃣ Recalcular total
      const totalDetalle = await tx.factura_compra_detalle.aggregate({
        where: { factura_id: facturaId },
        _sum: { subtotal: true }
      });

      const total = totalDetalle._sum.subtotal || 0;

      // 3️⃣ Actualizar factura
      await tx.factura_compras.update({
        where: { id: facturaId },
        data: {
          total,
          saldo: total
        }
      });

      return total;
    });

    return NextResponse.json({
      message: "Detalle agregado correctamente",
      total: result
    });

  } catch (error) {
    console.error("POST detalle compra error:", error);
    return NextResponse.json(
      { error: "Error al agregar detalle" },
      { status: 500 }
    );
  }
}

/* =========================
   ELIMINAR DETALLE
========================= */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const facturaId = Number(params.id);
    const { detalle_id } = await req.json();

    if (!detalle_id) {
      return NextResponse.json(
        { error: "detalle_id requerido" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Eliminar detalle
      await tx.factura_compra_detalle.delete({
        where: {
          id: Number(detalle_id)
        }
      });

      // 2️⃣ Recalcular total
      const totalDetalle = await tx.factura_compra_detalle.aggregate({
        where: { factura_id: facturaId },
        _sum: { subtotal: true }
      });

      const total = totalDetalle._sum.subtotal || 0;

      // 3️⃣ Actualizar factura
      await tx.factura_compras.update({
        where: { id: facturaId },
        data: {
          total,
          saldo: total
        }
      });

      return total;
    });

    return NextResponse.json({
      message: "Detalle eliminado correctamente",
      total: result
    });

  } catch (error) {
    console.error("DELETE detalle compra error:", error);
    return NextResponse.json(
      { error: "Error al eliminar detalle" },
      { status: 500 }
    );
  }
}
