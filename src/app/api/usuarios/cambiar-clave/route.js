import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getConnection } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    const conn = await getConnection();

    // Buscar usuario en DB
    const [rows] = await conn.execute(
      "SELECT * FROM usuarios WHERE id = ? LIMIT 1",
      [session.user.id]
    );

    if (rows.length === 0)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const user = rows[0];

    // Comparar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid)
      return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 });

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar DB
    await conn.execute(
      "UPDATE usuarios SET password = ? WHERE id = ?",
      [hashedPassword, user.id]
    );

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ocurrió un error al cambiar la contraseña" },
      { status: 500 }
    );
  }
}
