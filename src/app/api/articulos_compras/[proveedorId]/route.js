import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  const { proveedorId } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const data = await prisma.proveedor_articulos.findMany({
      where: {
        proveedor_id: Number(proveedorId)
      },
      include: {
        articulos_compras: {
          select: {
            id: true,
            codigo: true,
            descripcion: true,
            iva: true
          }
        },
        proveedores: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    // 🔄 Adaptamos la salida para que sea igual a tu SELECT
    const response = data.map(pa => ({
      proveedor_articulo_id: pa.id,
      articulo_id: pa.articulos_compras.id,
      codigo: pa.articulos_compras.codigo,
      descripcion: pa.articulos_compras.descripcion,
      iva: pa.articulos_compras.iva,
      proveedor_id: pa.proveedores.id,
      proveedor_nombre: pa.proveedores.nombre
    }));

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Error GET /articulos_compras:", error);
    return NextResponse.json(
      { error: "Error al obtener los artículos del proveedor" },
      { status: 500 }
    );
  }
}
