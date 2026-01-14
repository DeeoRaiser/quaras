
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();

    console.log("body")
    console.log(body)
    const { puntoVenta, numero, letra, fechaDesde, fechaHasta, cliente_id, estado } = body || {};

    let where = "WHERE 1=1";
    const params = [];

    if (puntoVenta) {
      where += " AND f.punto_vta = ?";
      params.push(puntoVenta);
    }
    if (estado !== "TODAS") {
      where += " AND f.estado = ?";
      params.push(estado);
    }
    if (numero) {
      where += " AND f.numero = ?";
      params.push(numero);
    }
    if (letra) {
      where += " AND f.letra = ?";
      params.push(letra);
    }
    if (fechaDesde) {
      where += " AND f.fecha >= ?";
      params.push(fechaDesde);
    }
    if (fechaHasta) {
      where += " AND f.fecha <= ?";
      params.push(fechaHasta);
    }
    if (cliente_id) {
      where += " AND f.cliente_id <= ?";
      params.push(cliente_id);
    }

    const conn = await getConnection();

    // ===========================================
    // 1️⃣ TRAER FACTURAS + CLIENTE + TOTALES
    // ===========================================
    const [facturas] = await conn.query(
      `
      SELECT 
        f.id,
        f.punto_vta,
        f.numero,
        f.letra,
        f.fecha,
        f.cliente_id,
        COALESCE(c.nombre, '') AS cliente_nombre,
        COALESCE(c.dni, '') AS cliente_dni,
        COALESCE(f.total, 0) AS totalFactura,
        COALESCE(SUM(ap.monto_aplicado), 0) AS totalPagado
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      LEFT JOIN aplicaciones_pagos ap ON ap.factura_id = f.id
      ${where}
      GROUP BY f.id
      ORDER BY f.fecha DESC, f.id DESC
      `,
      params
    );

    // Si no hay facturas, devolver array vacío
    if (facturas.length === 0) {
      return NextResponse.json([]);
    }

    const ids = facturas.map((f) => f.id);

    // ===========================================
    // 2️⃣ DETALLE POR ARTÍCULOS
    // ===========================================
    const [detalle] = await conn.query(
      `
      SELECT 
        id,
        factura_id,
        articulo_id,
        descripcion,
        cantidad,
        ajuste,
        precio_venta,
        iva,
        subtotal
      FROM factura_detalle
      WHERE factura_id IN (?)
      ORDER BY id
      `,
      [ids]
    );

    // ===========================================
    // 3️⃣ IMPUESTOS DISCRIMINADOS
    // ===========================================
    const [impuestos] = await conn.query(
      `
      SELECT
        id,
        factura_id,
        impuesto_id,
        codigo,
        nombre,
        alicuota,
        base_imponible,
        monto
      FROM factura_venta_impuestos
      WHERE factura_id IN (?)
      ORDER BY id
      `,
      [ids]
    );

    // ===========================================
    // 4️⃣ AJUSTES DE PIE
    // ===========================================
    const [ajustesPie] = await conn.query(
      `
      SELECT 
        id,
        factura_id,
        nombre,
        porcentaje,
        monto
      FROM factura_ajustes_pie
      WHERE factura_id IN (?)
      ORDER BY id
      `,
      [ids]
    );

    // ===========================================
    // 5️⃣ PAGOS
    // ===========================================
    const [pagos] = await conn.query(
      `
      SELECT 
        p.id,
        ap.factura_id,
        p.fecha,
        p.metodo,
        ap.monto_aplicado AS monto_aplicado
      FROM aplicaciones_pagos ap
      INNER JOIN pagos p ON p.id = ap.pago_id
      WHERE ap.factura_id IN (?)
      `,
      [ids]
    );

    // ===========================================
    // 6️⃣ ARMAR RESPUESTA COMPLETA
    // ===========================================
    const resultado = facturas.map((f) => {
      const totalFactura = Number(f.totalFactura) || 0;
      const totalPagado = Number(f.totalPagado) || 0;
      const saldo = Math.max(0, +(totalFactura - totalPagado).toFixed(2));

      return {
        ...f,
        detalle: detalle.filter((d) => d.factura_id === f.id),
        impuestos: impuestos.filter((i) => i.factura_id === f.id),
        ajustesPie: ajustesPie.filter((a) => a.factura_id === f.id),
        pagos: pagos.filter((p) => p.factura_id === f.id),
        totalFactura: totalFactura.toFixed(2),
        totalPagado: totalPagado.toFixed(2),
        saldoPendiente: saldo.toFixed(2),
        estado:
          saldo <= 0
            ? "PAGADA"
            : totalPagado > 0
              ? "PARCIAL"
              : "PENDIENTE",
      };
    });

    console.log(resultado)

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("POST /api/facturas-venta/list error:", error);
    return NextResponse.json(
      { error: "Error al obtener facturas" },
      { status: 500 }
    );
  }
}
