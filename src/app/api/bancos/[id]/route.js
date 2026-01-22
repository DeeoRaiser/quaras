import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // ✅ params es Promise
    const { id } = await params;
    const bancoId = Number(id);

    if (!bancoId || isNaN(bancoId)) {
      return NextResponse.json(
        { error: "ID de banco inválido" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { nombre, sucursal, nro_cuenta, cbu, nota } = data;

    await prisma.bancos.update({
      where: { id: bancoId },
      data: {
        nombre,
        sucursal,
        nro_cuenta,
        cbu,
        nota,
      },
    });

    return NextResponse.json({
      message: "Banco actualizado correctamente",
    });

  } catch (error) {
    console.error("PUT /bancos error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Banco no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar banco" },
      { status: 500 }
    );
  }
}


export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = Number(params.id);

    await prisma.bancos.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Banco eliminado correctamente"
    });

  } catch (error) {
    console.error("DELETE /bancos error:", error);

    return NextResponse.json(
      { error: "Error al eliminar banco" },
      { status: 500 }
    );
  }
}
