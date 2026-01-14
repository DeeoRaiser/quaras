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

// ============
// PUT
// ============
export async function PUT(req, { params }) {
  try {
    await requireAuth();

    const id = params.id;
    const { tipo, moneda, numero, cbu, alias, nota } = await req.json();

    const conn = await getConnection();

    await conn.execute(
      `
      UPDATE cuentas_bancarias
      SET tipo=?, moneda=?, numero=?, cbu=?, alias=?, nota=?
      WHERE id=?
    `,
      [tipo, moneda, numero, cbu || null, alias || null, nota || null, id]
    );

    return json({ message: "Cuenta modificada correctamente" });
  } catch (error) {
    if (error.message === "UNAUTHORIZED")
      return json({ error: "No autorizado" }, 401);

    return json({ error: "Error al modificar cuenta" }, 500);
  }
}

// ============
// DELETE
// ============
export async function DELETE(req, { params }) {
  try {
    await requireAuth();

    const id = params.id;

    const conn = await getConnection();
    await conn.execute("DELETE FROM cuentas_bancarias WHERE id=?", [id]);

    return json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    if (error.message === "UNAUTHORIZED")
      return json({ error: "No autorizado" }, 401);

    return json({ error: "Error al eliminar cuenta" }, 500);
  }
}
