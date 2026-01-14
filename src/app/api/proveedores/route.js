import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { getConnection } from "@/lib/db";

// ➤ Crear proveedor
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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

    console.log(data)

    const conn = await getConnection();
    const query = `
      INSERT INTO proveedores 
      (nombre, razonsocial, iva,
      iibb, numiibb, cuit, direccion, 
      telefono, email, nota) 
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `;

    await conn.execute(query, [
  nombre || null,
  razonsocial || null,
  iva || null,
  iibb || null,
  numiibb || null,
  cuit || null,
  direccion || null,
  telefono || null,
  email || null,
  nota || null
]);

    return NextResponse.json(
      { message: "Proveedor creado correctamente" },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear proveedor" },
      { status: 500 }
    );
  }
}


// ➤ Obtener lista de proveedores
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM proveedores ORDER BY id DESC"
    );

    return NextResponse.json(rows);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener los proveedores" },
      { status: 500 }
    );
  }
}
