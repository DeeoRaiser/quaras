import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";


// -----------------------------------------------------
// GET → Listar clientes
// -----------------------------------------------------
export async function GET() {
  try {
    const clientes = await prisma.clientes.findMany({
      orderBy: {
        id: "desc"
      }
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("GET clientes error:", error);
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}


// -----------------------------------------------------
// POST → Crear cliente
// -----------------------------------------------------
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await req.json();

    await prisma.cliente.create({
      data: {
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        dni: data.dni || "",
        cuit: data.cuit || "",
        iva: data.iva || "",
        iibb: data.iibb || "",
        numiibb: data.numiibb || "",
        direccion: data.direccion || "",
        telefono: data.telefono || "",
        email: data.email || "",
        nota: data.nota || ""
      }
    });

    return NextResponse.json({
      message: "Cliente creado correctamente"
    });

  } catch (error) {
    console.error("POST clientes error:", error);
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}
