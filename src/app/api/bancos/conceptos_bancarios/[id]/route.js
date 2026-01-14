import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function PUT(req, { params }) {
    try {
        const { id } = params
        const data = await req.json()
        const { nombre, parent_id } = data

        const conn = await getConnection()

        const query =
            `UPDATE clasificacion_conceptos_bancarios
      SET nombre = ?, parent_id  = ?  WHERE id = ?`

        await conn.execute(query, [nombre, parent_id, id])

        return NextResponse.json({ message: "Concepto bancario actualizado correctamente" })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Error al actualizar concepto bancario" },
            { status: 500 }
        );
    }
}


export async function DELETE(req, { params }) {
    try {
        const { id } = params
        const conn = await getConnection()

        await conn.execute("DELETE FROM clasificacion_conceptos_bancarios WHERE id = ?", [id])

        return NextResponse.json({ message: "Concepto bancario eliminado correctamente" })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Error al eliminar banco" },
            { status: 500 }
        )
    }
}