import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import {prisma} from "@/lib/prisma";

/* =============================
   ➤ CREAR PROVEEDOR
============================= */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await req.json();

    const {
      nombre,
      razonsocial,
      iva,
      iibb,
      numiibb,
      cuit,
      direccion,
      telefono,
      email,
      nota
    } = data;

    await prisma.proveedores.create({
      data: {
        nombre: nombre ?? null,
        razonsocial: razonsocial ?? null,
        iva: iva ?? null,
        iibb: iibb ?? null,
        numiibb: numiibb ?? null,
        cuit: cuit ?? null,
        direccion: direccion ?? null,
        telefono: telefono ?? null,
        email: email ?? null,
        nota: nota ?? null
      }
    });

    return NextResponse.json(
      { message: "Proveedor creado correctamente" },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST proveedor error:", error);
    return NextResponse.json(
      { error: "Error al crear proveedor" },
      { status: 500 }
    );
  }
}

/* =============================
   ➤ LISTAR PROVEEDORES
============================= */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const proveedores = await prisma.proveedores.findMany({
      orderBy: { id: "desc" }
    });

    return NextResponse.json(proveedores);

  } catch (error) {
    console.error("GET proveedores error:", error);
    return NextResponse.json(
      { error: "Error al obtener los proveedores" },
      { status: 500 }
    );
  }
}
