import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
    try {
        const id = Number(params.id);
        const data = await req.json();

        const { nombre, parent_id } = data;

        await prisma.clasificacion_conceptos_bancarios.update({
            where: { id },
            data: {
                nombre,
                parent_id
            }
        });

        return NextResponse.json({
            message: "Concepto bancario actualizado correctamente"
        });

    } catch (error) {
        console.error("PUT concepto bancario error:", error);

        return NextResponse.json(
            { error: "Error al actualizar concepto bancario" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const id = Number(params.id);

        await prisma.clasificacion_conceptos_bancarios.delete({
            where: { id }
        });

        return NextResponse.json({
            message: "Concepto bancario eliminado correctamente"
        });

    } catch (error) {
        if (error.code === "P2003") {
            return NextResponse.json(
                { error: "No se puede eliminar: tiene conceptos hijos" },
                { status: 400 }
            );
        }
    }
}
