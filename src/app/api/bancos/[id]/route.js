import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { ConstructionOutlined } from "@mui/icons-material";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const { nombre, sucursal, nro_cuenta, cbu, nota } =  data;

    const conn = await getConnection();

    const query = `
      UPDATE bancos
      SET nombre = ?, sucursal = ?, nro_cuenta = ?, cbu = ?, nota = ?
      WHERE id = ?
    `;

    await conn.execute(query, [nombre, sucursal, nro_cuenta, cbu, nota, id]);

    return NextResponse.json({ message: "Banco actualizado correctamente" });
  } catch (error) {
    console.error(error);
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

    const { id } = params;
    const conn = await getConnection();

    await conn.execute("DELETE FROM bancos WHERE id = ?", [id]);

    return NextResponse.json({ message: "Banco eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar banco" },
      { status: 500 }
    );
  }
}
