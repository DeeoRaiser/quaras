import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getConnection } from "@/lib/db";



export async function GET(req, context) {
  try {
    const { params } = await context;
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const conn = await getConnection();

    // Factura base
    const [factRows] = await conn.query(
      `
      SELECT f.*, c.nombre AS cliente_nombre, c.id as cliente_id, c.dni AS cliente_dni
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      WHERE f.id = ? LIMIT 1
    `,
      [id]
    );


    if (factRows.length === 0) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 405 }
      );
    }


    const factura = factRows[0];

    // Detalle
    const [detalle] = await conn.query(
      `
      SELECT fd.*, a.codigo AS articulo_codigo 
      FROM factura_detalle fd
      LEFT JOIN articulos a ON a.id = fd.articulo_id
      WHERE fd.factura_id = ?
      ORDER BY fd.id ASC
    `,
      [id]
    );


    console.log("------------------------")
    console.log(detalle)

    // Pagos aplicados a la factura
    const [pagos] = await conn.query(
      `
      SELECT *
      FROM pagos
      WHERE factura_id = ?
      ORDER BY fecha ASC, id ASC
    `,
      [id]
    );

    factura.detalle = detalle;
    factura.pagos = pagos;

    return NextResponse.json(factura);
  } catch (error) {
    console.error("GET factura error:", error);
    return NextResponse.json(
      { error: "Error al obtener factura" },
      { status: 500 }
    );
  }
}

// Editar cabecera factura (no maneja detalle acá)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = params;
    const data = await req.json();
    const { fecha, numero, letra, punto_vta, observacion } = data;

    const conn = await getConnection();
    const [res] = await conn.execute(
      `UPDATE facturas SET fecha = ?, numero = ?, letra = ?, punto_vta = ?, observacion = ? WHERE id = ?`,
      [fecha || null, numero || null, letra || null, punto_vta || null, observacion || null, id]
    );

    if (res.affectedRows === 0) return NextResponse.json({ error: "Factura no encontrada" }, { status: 405 });

    return NextResponse.json({ message: "Factura actualizada correctamente" });
  } catch (error) {
    console.error("PUT factura error:", error);
    return NextResponse.json({ error: "Error al actualizar factura" }, { status: 500 });
  }
}

// DELETE opcional: solo si querés permitir borrar facturas (considerar reglas fiscales)
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await context.params;
    const conn = await getConnection();
    await conn.execute("DELETE FROM facturas WHERE id = ?", [id]);

    return NextResponse.json({ message: "Factura eliminada" });
  } catch (error) {
    console.error("DELETE factura error:", error);
    return NextResponse.json({ error: "Error al eliminar factura" }, { status: 500 });
  }
}
