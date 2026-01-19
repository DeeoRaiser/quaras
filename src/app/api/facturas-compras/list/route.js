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
    const {
      puntoVenta,
      numero,
      letra,
      fechaDesde,
      fechaHasta,
      proveedor_id,
      estado = "TODAS"
    } = body || {};


    console.log("body")

    console.log(body)


    let where = "WHERE 1=1";
    const params = [];

    if (puntoVenta) {
      where += " AND fc.punto_vta = ?";
      params.push(puntoVenta);
    }

    if (numero) {
      where += " AND fc.numero = ?";
      params.push(numero);
    }

    if (estado !== "TODAS") {
      where += " AND f.estado = ?";
      params.push(estado);
    }

    if (letra) {
      where += " AND fc.letra = ?";
      params.push(letra);
    }

    if (fechaDesde) {
      where += " AND fc.fecha >= ?";
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      where += " AND fc.fecha <= ?";
      params.push(fechaHasta);
    }

    if (proveedor_id) {
      where += " AND fc.proveedor_id = ?";
      params.push(proveedor_id);
    }

    const conn = await getConnection();

    /* ==========================================
       1️⃣ FACTURAS + PROVEEDOR + PAGOS
    ========================================== */

    console.log(params)

    const [facturas] = await conn.query(
      `
      SELECT 
        fc.id,
        fc.punto_vta,
        fc.numero,
        fc.letra,
        fc.fecha,
        fc.proveedor_id,
        pr.nombre AS proveedor_nombre,
        pr.cuit AS proveedor_cuit,
        COALESCE(fc.total, 0) AS totalFactura,
        COALESCE(SUM(ap.monto_aplicado), 0) AS totalPagado
      FROM factura_compras fc
      LEFT JOIN proveedores pr ON pr.id = fc.proveedor_id
      LEFT JOIN aplicaciones_pagos_compras ap ON ap.factura_id = fc.id
      ${where}
      GROUP BY fc.id
      ORDER BY fc.fecha DESC, fc.id DESC
      `,
      params
    );

    if (facturas.length === 0) {
      return NextResponse.json([]);
    }

    const ids = facturas.map((f) => f.id);

    /* ==========================================
       2️⃣ DETALLE
    ========================================== */
    const [detalle] = await conn.query(
      `
      SELECT 
        id,
        factura_id,
        articulo_id,
        descripcion,
        cantidad,
        ajuste,
        precio_compra,
        iva,
        subtotal,
        centro_costo_id
      FROM factura_compra_detalle
      WHERE factura_id IN (?)
      ORDER BY id
      `,
      [ids]
    );

    /* ==========================================
       3️⃣ IMPUESTOS
    ========================================== */
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
      FROM factura_compra_impuestos
      WHERE factura_id IN (?)
      `,
      [ids]
    );

    /* ==========================================
       4️⃣ AJUSTES PIE
    ========================================== */
    const [ajustesPie] = await conn.query(
      `
      SELECT 
        id,
        factura_id,
        nombre,
        porcentaje,
        monto
      FROM factura_compra_ajustes_pie
      WHERE factura_id IN (?)
      `,
      [ids]
    );

    /* ==========================================
       5️⃣ PAGOS
    ========================================== */
    const [pagos] = await conn.query(
      `
      SELECT 
        pc.id,
        ap.factura_id,
        pc.fecha,
        pc.metodo,
        ap.monto_aplicado
      FROM aplicaciones_pagos_compras ap
      INNER JOIN pagos_compras pc ON pc.id = ap.pago_id
      WHERE ap.factura_id IN (?)
      `,
      [ids]
    );

    /* ==========================================
       6️⃣ ARMAR RESPUESTA FINAL
    ========================================== */
    const resultado = facturas
      .map((f) => {
        const totalFactura = Number(f.totalFactura) || 0;
        const totalPagado = Number(f.totalPagado) || 0;
        const saldo = Math.max(0, +(totalFactura - totalPagado).toFixed(2));

        const estadoCalculado =
          saldo <= 0
            ? "PAGADA"
            : totalPagado > 0
              ? "PARCIAL"
              : "PENDIENTE";

        return {
          ...f,
          detalle: detalle.filter((d) => d.factura_id === f.id),
          impuestos: impuestos.filter((i) => i.factura_id === f.id),
          ajustesPie: ajustesPie.filter((a) => a.factura_id === f.id),
          pagos: pagos.filter((p) => p.factura_id === f.id),
          totalFactura: totalFactura.toFixed(2),
          totalPagado: totalPagado.toFixed(2),
          saldoPendiente: saldo.toFixed(2),
          estado: estadoCalculado,
        };
      })
      .filter((f) => !estado || estado === "TODAS" || f.estado === estado);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("POST /facturas-compras/list error:", error);
    return NextResponse.json(
      { error: "Error al obtener facturas de compras" },
      { status: 500 }
    );
  }
}
