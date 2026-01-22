import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // 1️⃣ Buscar usuario
    const user = await prisma.usuarios.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 2️⃣ Verificar contraseña actual
    const isValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña actual incorrecta" },
        { status: 400 }
      );
    }

    // 3️⃣ Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Actualizar contraseña
    await prisma.usuarios.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      message: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error("POST /change-password error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al cambiar la contraseña" },
      { status: 500 }
    );
  }
}
