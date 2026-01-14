import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { getConnection } from "@/lib/db";

// ➤ Crear categoría
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const data = await req.json();
    const { nombre, tipo, descripcion } = data;

    const conn = await getConnection();
    await conn.execute(
      `INSERT INTO categorias (nombre, tipo, descripcion)
       VALUES (?, ?, ?)`,
      [
        nombre,
        tipo || "gasto",
        descripcion || null
      ]
    );

    return NextResponse.json({ message: "Categoría creada correctamente" }, { status: 201 });
  } catch (error) {
    console.error("POST categorias error:", error);
    return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 });
  }
}

// ➤ Listar categorías
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM categorias ORDER BY id DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET categorias error:", error);
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}
