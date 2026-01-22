import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {prisma} from "@/lib/prisma";

export async function POST(req) {
  try {
    const { nombre, apellido, usuario, password } = await req.json();

    if (!usuario || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    // 1️⃣ Verificar si el usuario ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { usuario }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // 2️⃣ Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Crear usuario
    await prisma.usuarios.create({
      data: {
        nombre: nombre || null,
        apellido: apellido || null,
        usuario,
        password: hashedPassword
      }
    });

    return NextResponse.json({
      message: "Usuario creado correctamente"
    }, { status: 201 });

  } catch (error) {
    console.error("POST /usuarios error:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
