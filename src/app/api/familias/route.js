import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Crear familia
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { descripcion } = await req.json();

    if (!descripcion) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    const conn = await getConnection();
    const sql = `
      INSERT INTO familias (descripcion)
      VALUES (?)
    `;

    await conn.execute(sql, [descripcion]);

    return NextResponse.json(
      { message: "Familia creada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /familias:", error);
    return NextResponse.json(
      { error: "Error al crear familia" },
      { status: 500 }
    );
  }
}

// Obtener todas las familias
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM familias ORDER BY nombre ASC"
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error GET /familias:", error);
    return NextResponse.json(
      { error: "Error al obtener familias" },
      { status: 500 }
    );
  }
}
