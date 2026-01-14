import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";


// -----------------------------------------------------
// GET: Listar categorías activas
// -----------------------------------------------------
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const conn = await getConnection();
    const [rows] = await conn.query(`
      SELECT cg.*, cc.nombre AS centro_costo
      FROM categorias_gastos cg
      INNER JOIN centros_costo cc ON cc.id = cg.centro_costo_id
      WHERE cg.estado = 1
      ORDER BY cg.id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener categorías de gastos" },
      { status: 500 }
    );
  }
}



// -----------------------------------------------------
// POST: Crear categoría
// -----------------------------------------------------
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await req.json();
    const { nombre, descripcion, centro_costo_id, tipo, iva } = data;

    if (!nombre || !centro_costo_id) {
      return NextResponse.json(
        { error: "Nombre y centro de costo son obligatorios" },
        { status: 400 }
      );
    }

    const conn = await getConnection();

    const query = `
      INSERT INTO categorias_gastos 
        (nombre, descripcion, centro_costo_id, tipo, iva)
      VALUES (?, ?, ?, ?, ?)
    `;

    await conn.execute(query, [
      nombre,
      descripcion ?? null,
      centro_costo_id,
      tipo ?? "general",
      iva ?? 21.00,
    ]);

    return NextResponse.json(
      { message: "Categoría creada correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 }
    );
  }
}



// -----------------------------------------------------
// PUT: Actualizar categoría
// -----------------------------------------------------
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID de la categoría" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { nombre, descripcion, centro_costo_id, tipo, iva, estado } = data;

    const conn = await getConnection();

    const query = `
      UPDATE categorias_gastos
      SET 
        nombre = ?, 
        descripcion = ?, 
        centro_costo_id = ?, 
        tipo = ?, 
        iva = ?, 
        estado = ?
      WHERE id = ?
    `;

    await conn.execute(query, [
      nombre,
      descripcion ?? null,
      centro_costo_id,
      tipo ?? "general",
      iva ?? 21.00,
      estado ?? 1,
      id,
    ]);

    return NextResponse.json(
      { message: "Categoría actualizada correctamente" }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar categoría" },
      { status: 500 }
    );
  }
}



// -----------------------------------------------------
// DELETE: Borrado lógico (estado = 0)
// -----------------------------------------------------
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID de la categoría" },
        { status: 400 }
      );
    }

    const conn = await getConnection();

    await conn.execute(
      `UPDATE categorias_gastos SET estado = 0 WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      message: "Categoría eliminada correctamente (borrado lógico)",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 }
    );
  }
}
