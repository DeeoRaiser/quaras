import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

// Obtener una clasificación
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM clasificaciones WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Clasificación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Error GET /clasificaciones/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener clasificación" },
      { status: 500 }
    );
  }
}

// Editar clasificación
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;
    const { descripcion } = await req.json();

    if (!descripcion) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    const conn = await getConnection();
    await conn.execute(
      "UPDATE clasificaciones SET descripcion = ? WHERE id = ?",
      [descripcion, id]
    );

    return NextResponse.json(
      { message: "Clasificación actualizada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT /clasificaciones/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar clasificación" },
      { status: 500 }
    );
  }
}

// Eliminar clasificación
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;

    const conn = await getConnection();
    await conn.execute("DELETE FROM clasificaciones WHERE id = ?", [id]);

    return NextResponse.json(
      { message: "Clasificación eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error DELETE /clasificaciones/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar clasificación" },
      { status: 500 }
    );
  }
}
