import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Crear banco
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { nombre, sucursal, nro_cuenta, cbu, nota } = await req.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre del banco es obligatorio" },
        { status: 400 }
      );
    }

    const conn = await getConnection();
    const sql = `
      INSERT INTO bancos (nombre, sucursal, nro_cuenta, cbu, nota)
      VALUES (?, ?, ?, ?, ?)
    `;

    await conn.execute(sql, [nombre, sucursal, nro_cuenta, cbu, nota]);

    return NextResponse.json(
      { message: "Banco creado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /bancos:", error);
    return NextResponse.json({ error: "Error al crear banco" }, { status: 500 });
  }
}

// Obtener todos los bancos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM bancos ORDER BY id DESC"
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error GET /bancos:", error);
    return NextResponse.json(
      { error: "Error al obtener los bancos" },
      { status: 500 }
    );
  }
}
