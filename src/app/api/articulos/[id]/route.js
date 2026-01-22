import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server.js";
import { prisma } from "@/lib/prisma";


// =======================
// PUT → actualizar artículo
// =======================
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // ✅ params es Promise
    const { id } = await params;
    const articuloId = Number(id);

    const data = await req.json();

    console.log("data", data);
    console.log("id", articuloId);

    // Validar ID
    if (!articuloId || isNaN(articuloId)) {
      return NextResponse.json(
        { error: "ID de artículo inválido" },
        { status: 400 }
      );
    }

    // Validar datos mínimos
    if (!data.descripcion || !data.precio || !data.iva_id) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Convertir descuentos a string
    const descuentos = Array.isArray(data.descuentos)
      ? data.descuentos.join(",")
      : data.descuentos || "";

    const articuloActualizado = await prisma.articulos.update({
      where: { id: articuloId },
      data: {
        descripcion: data.descripcion,
        precio: parseFloat(data.precio),
        iva_id: Number(data.iva_id),
        descuentos,
        precio_neto: parseFloat(data.precio_neto) || 0,
        utilidad: parseFloat(data.utilidad) || 0,
        precio_venta: parseFloat(data.precio_venta) || 0,
        maneja_stock: Number(data.maneja_stock) || 0,
        nota: data.nota || "",
        familia_id: Number(data.familia_id) || null,
        categoria_id: Number(data.categoria_id) || null,
        clasificacion_id: Number(data.clasificacion_id) || null,
        centro_costo_id: Number(data.centro_costo_id) || null,
      },
    });

    return NextResponse.json(articuloActualizado, { status: 200 });

  } catch (error) {
    console.error("Error PUT /articulos:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Artículo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el artículo" },
      { status: 500 }
    );
  }
}
