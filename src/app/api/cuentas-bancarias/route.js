import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("UNAUTHORIZED");
}

// ====================
// GET - Listar cuentas
// ====================
export async function GET() {
  try {
    await requireAuth();

    const conn = await getConnection();
    const [rows] = await conn.query(`
      SELECT cb.*, b.nombre AS banco_nombre 
      FROM cuentas_bancarias cb
      JOIN bancos b ON b.id = cb.banco_id
      ORDER BY cb.id DESC
    `);

    return json(rows);
  } catch (error) {
    if (error.message === "UNAUTHORIZED")
      return json({ error: "No autorizado" }, 401);

    return json({ error: "Error al obtener cuentas" }, 500);
  }
}

// ====================
// POST - Crear cuenta
// ====================
export async function POST(req) {
  try {
    await requireAuth();

    const { banco_id, tipo, moneda, numero, cbu, alias, nota } =
      await req.json();

    if (!banco_id || !tipo || !numero) {
      return json({ error: "Faltan datos obligatorios" }, 400);
    }

    const conn = await getConnection();

    await conn.execute(
      `INSERT INTO cuentas_bancarias 
        (banco_id, tipo, moneda, numero, cbu, alias, nota)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [banco_id, tipo, moneda, numero, cbu || null, alias || null, nota || null]
    );

    return json({ message: "Cuenta creada correctamente" }, 201);
  } catch (error) {
    if (error.message === "UNAUTHORIZED")
      return json({ error: "No autorizado" }, 401);

    return json({ error: "Error al crear cuenta" }, 500);
  }
}
