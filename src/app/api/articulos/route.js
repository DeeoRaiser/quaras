import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const articulos = await prisma.articulos.findMany({
      include: {
        iva: {
          select: {
            porcentaje: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    });

    // 🔄 Adaptamos la salida para que coincida con tu SELECT original
    const response = articulos.map(a => ({
      id: a.id,
      descripcion: a.descripcion,
      precio: a.precio,
      iva_id: a.iva_id,
      iva: a.iva?.porcentaje ?? null,
      descuentos: a.descuentos,
      precio_neto: a.precio_neto,
      utilidad: a.utilidad,
      precio_venta: a.precio_venta,
      maneja_stock: a.maneja_stock,
      nota: a.nota,
      familia_id: a.familia_id,
      categoria_id: a.categoria_id,
      clasificacion_id: a.clasificacion_id,
      codigo: a.codigo,
      centro_costo_id: a.centro_costo_id
    }));

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Error GET /articulos:", error);
    return NextResponse.json(
      { error: "Error al obtener los articulos" },
      { status: 500 }
    );
  }
}


// =======================
// POST → crear nuevo artículo
// =======================
export async function POST(req) {
  try {
    const data = await req.json();

    console.log("data")
    console.log(data)

    // Validar datos mínimos
    if (!data.descripcion || !data.precio || !data.iva_id) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Convertir descuentos a string si vino como array
    const descuentos =
      Array.isArray(data.descuentos) ? data.descuentos.join(",") : data.descuentos || "";

    // Crear artículo
    const nuevoArticulo = await prisma.articulos.create({
      data: {
        descripcion: data.descripcion,
        precio: parseFloat(data.precio),
        iva_id: Number(data.iva_id),
        descuentos,
        precio_neto: parseFloat(data.precio_neto) || 0,
        utilidad: parseFloat(data.utilidad) || 0,
        precio_venta: parseFloat(data.precio_venta) || 0,
        maneja_stock: parseFloat(data.maneja_stock) || 0,
        nota: data.nota || "",
        familia_id: Number(data.familia_id),
        categoria_id: Number(data.categoria_id),
        clasificacion_id: Number(data.clasificacion_id),
        centro_costo_id: Number(data.centro_costo_id),
      },
    });

    return NextResponse.json(nuevoArticulo, { status: 201 });
  } catch (error) {
    console.error("Error POST /articulos:", error);
    return NextResponse.json(
      { error: "No se pudo crear el artículo" },
      { status: 500 }
    );
  }
}