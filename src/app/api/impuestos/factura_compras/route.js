import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const conn = await getConnection();
        const [rows] = await conn.query(
            'SELECT id, codigo, nombre, alicuota FROM impuestos ORDER BY nombre ASC'
        );

        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error("Error GET /impuestos:", error);
        return NextResponse.json(
            { error: "Error al obtener los impuestos" },
            { status: 500 }
        );
    }
}
