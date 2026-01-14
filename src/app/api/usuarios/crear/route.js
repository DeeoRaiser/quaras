import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getConnection } from "@/lib/db";

export async function POST(req) {
  try {
   const { nombre, apellido, usuario, password } = await req.json();
    const conn = await getConnection();

    // Verificar que el usuario no exista
    const [existing] = await conn.execute(
      "SELECT id FROM usuarios WHERE usuario = ?",
      [usuario]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en la DB
    await conn.execute(
  "INSERT INTO usuarios (nombre, apellido, usuario, password) VALUES (?, ?, ?, ?)",
  [nombre, apellido, usuario, hashedPassword]
);

    return NextResponse.json({
      message: "Usuario creado correctamente",
      password,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
