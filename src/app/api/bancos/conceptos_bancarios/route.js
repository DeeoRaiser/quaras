
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function POST(req) {
    try {
        const data = await req.json();
        const { nombre, parent_id  } = data;

        const conn = await getConnection();
        const query = `
      INSERT INTO clasificacion_conceptos_bancarios (nombre, parent_id )
      VALUES (?, ?)
    `;
        await conn.execute(query, [nombre, parent_id ]);

        return NextResponse.json({ message: "Concepto creado correctamente" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error al crear concepto" }, { status: 500 });
    }
}


export async function GET() {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query("SELECT * FROM clasificacion_conceptos_bancarios ORDER BY nombre DESC");
        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error al obtener los conceptos" },
            { status: 500 }
        );
    }
}

