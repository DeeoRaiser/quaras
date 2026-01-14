import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";

// GET → Listar clientes
export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT * FROM clientes ORDER BY id DESC");
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET clientes error:", err);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

// POST → Crear cliente
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await req.json();

    const conn = await getConnection();
    await conn.execute(
      `INSERT INTO clientes
      (nombre, apellido, dni, cuit, iva, iibb, numiibb, direccion, telefono, email, nota)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.nombre || "",
        data.apellido || "",
        data.dni || "",
        data.cuit || "",
        data.iva || "",
        data.iibb || "",
        data.numiibb || "",
        data.direccion || "",
        data.telefono || "",
        data.email || "",
        data.nota || "",
      ]
    );

    return NextResponse.json({ message: "Cliente creado correctamente" });

  } catch (err) {
    console.error("POST clientes error:", err);
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 });
  }
}
