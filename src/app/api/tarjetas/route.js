import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { getConnection } from "@/lib/db";

// ➤ Crear tarjeta
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const {
      nombre,
      entidad,
      tipo,
      comision_porcentaje,
      comision_fija,
      nota
    } = await req.json();

    const conn = await getConnection();
    const query = `
      INSERT INTO tarjetas_credito
      (nombre, entidad, tipo, comision_porcentaje, comision_fija, nota)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await conn.execute(query, [
      nombre,
      entidad || null,
      tipo || "credito",
      comision_porcentaje || 0,
      comision_fija || 0,
      nota || null
    ]);

    return NextResponse.json(
      { message: "Tarjeta creada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST tarjeta:", error);
    return NextResponse.json({ error: "Error al crear tarjeta" }, { status: 500 });
  }
}

// ➤ Listar tarjetas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM tarjetas_credito ORDER BY id DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET tarjetas:", error);
    return NextResponse.json({ error: "Error al obtener tarjetas" }, { status: 500 });
  }
}
