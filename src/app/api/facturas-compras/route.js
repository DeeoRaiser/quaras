import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

/* ======================================================
   LISTAR FACTURAS DE COMPRAS
====================================================== */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const puntoVenta = searchParams.get("puntoVenta");
    const numero = searchParams.get("numero");
    const letra = searchParams.get("letra");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");

    let query = `
      SELECT 
        fc.*,
        p.nombre AS proveedor_nombre
      FROM factura_compras fc
      LEFT JOIN proveedores p ON p.id = fc.proveedor_id
      WHERE 1=1
    `;

    const params = [];

    if (puntoVenta) {
      query += " AND fc.punto_vta = ?";
      params.push(puntoVenta);
    }
    if (letra) {
      query += " AND fc.letra = ?";
      params.push(letra);
    }
    if (numero) {
      query += " AND fc.numero = ?";
      params.push(numero);
    }
    if (fechaDesde) {
      query += " AND fc.fecha >= ?";
      params.push(fechaDesde + " 00:00:00");
    }
    if (fechaHasta) {
      query += " AND fc.fecha <= ?";
      params.push(fechaHasta + " 23:59:59");
    }

    query += " ORDER BY fc.fecha DESC, fc.id DESC";

    const conn = await getConnection();
    const [rows] = await conn.query(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /facturas-compras error:", error);
    return NextResponse.json(
      { error: "Error al obtener facturas de compras" },
      { status: 500 }
    );
  }
}

/* ======================================================
   CREAR FACTURA DE COMPRA
====================================================== */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    const {
      proveedor_id,
      fecha,
      observacion,
      detalle = [],
      impuestos = [],
      ajustesPie = [],
      pagos = [],
      numero,
      puntoVenta,
      letra,
      totalFinal,
      saldo: saldoCalculado,
      estado: estadoCalculado,
    } = data;

    if (!proveedor_id || !fecha) {
      return NextResponse.json(
        { error: "Proveedor y fecha son obligatorios" },
        { status: 400 }
      );
    }

    const conn = await getConnection();

    /* ======================================================
       1️⃣ PUNTO DE VENTA
    ====================================================== */
    const [pvRows] = await conn.query(
      "SELECT id, punto_venta, letra, numero FROM puntos_venta WHERE usuario_id = ? LIMIT 1",
      [userId]
    );

    if (pvRows.length === 0) {
      return NextResponse.json(
        { error: "El usuario no tiene punto de venta configurado" },
        { status: 400 }
      );
    }

    const pv = pvRows[0];
    const punto_vta = puntoVenta ?? pv.punto_venta;
    const letraCab = letra ?? pv.letra;
    const numeroCab = numero ?? pv.numero + 1;

    /* ======================================================
       2️⃣ VALIDAR UNICIDAD
    ====================================================== */
    const [exists] = await conn.query(
      `
      SELECT id 
      FROM factura_compras 
      WHERE punto_vta = ? AND letra = ? AND numero = ?
      LIMIT 1
      `,
      [punto_vta, letraCab, numeroCab]
    );

    if (exists.length > 0) {
      return NextResponse.json(
        { error: "Número de comprobante ya existente" },
        { status: 400 }
      );
    }

    /* ======================================================
       3️⃣ INSERT CABECERA
    ====================================================== */
    const [res] = await conn.execute(
      `
      INSERT INTO factura_compras
      (proveedor_id, fecha, numero, letra, punto_vta, total, saldo, estado, observacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        proveedor_id,
        fecha,
        numeroCab,
        letraCab,
        punto_vta,
        Number(totalFinal),
        Number(saldoCalculado),
        estadoCalculado || "PENDIENTE",
        observacion || null,
      ]
    );

    const facturaId = res.insertId;

    /* ======================================================
       4️⃣ DETALLE
    ====================================================== */
    for (const it of detalle) {
      const {
        articulo_id = null,
        descripcion = "",
        cantidad = 1,
        precio_compra = 0,
        ajuste = 0,
        iva = 0,
        subtotal,
        centroCosto,
      } = it;

      await conn.execute(
        `
        INSERT INTO factura_compra_detalle
        (factura_id, articulo_id, descripcion, cantidad, precio_compra, ajuste, iva, subtotal, centro_costo_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          facturaId,
          articulo_id,
          descripcion,
          cantidad,
          precio_compra,
          ajuste,
          iva,
          Number(subtotal),
          centroCosto ?? null,
        ]
      );
    }

    /* ======================================================
       5️⃣ IMPUESTOS
    ====================================================== */
    for (const imp of impuestos) {
      await conn.execute(
        `
        INSERT INTO factura_compra_impuestos
        (factura_id, impuesto_id, codigo, nombre, alicuota, base_imponible, monto)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          facturaId,
          imp.impuesto_id,
          imp.codigo,
          imp.nombre,
          imp.alicuota,
          Number(imp.base_imponible),
          Number(imp.monto),
        ]
      );
    }

    /* ======================================================
       6️⃣ AJUSTES PIE
    ====================================================== */
    for (const aj of ajustesPie) {
      await conn.execute(
        `
        INSERT INTO factura_compra_ajustes_pie
        (factura_id, nombre, porcentaje, monto)
        VALUES (?, ?, ?, ?)
        `,
        [
          facturaId,
          aj.nombre,
          Number(aj.porcentaje),
          Number(aj.monto),
        ]
      );
    }

    /* ======================================================
       7️⃣ PAGOS
    ====================================================== */
    let totalPagos = 0;

    for (const p of pagos) {
      if (!p.metodo || !p.monto || Number(p.monto) <= 0) continue;

      const [pRes] = await conn.execute(
        `
        INSERT INTO pagos_compras
        (proveedor_id, factura_id, fecha, metodo, monto, banco, lote, cupon, tarjeta, comprobante, observacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          proveedor_id,
          facturaId,
          p.fecha ?? fecha,
          p.metodo,
          Number(p.monto),
          p.banco,
          p.lote,
          p.cupon,
          p.tarjeta,
          p.comprobante,
          p.observacion,
        ]
      );

      await conn.execute(
        `
        INSERT INTO aplicaciones_pagos_compras
        (pago_id, factura_id, monto_aplicado)
        VALUES (?, ?, ?)
        `,
        [pRes.insertId, facturaId, Number(p.monto)]
      );

      totalPagos += Number(p.monto);



      // ⬇️ DESPUÉS de insertar pagos_compras y aplicaciones

      if (
        ["TRANSFERENCIA", "CHEQUE_PROPIO", "ECHEQ"].includes(p.metodo)
      ) {
        if (!p.cuenta_bancaria_id) {
          throw new Error(
            "Falta cuenta bancaria para movimiento bancario"
          );
        }

        // Traemos el banco desde la cuenta bancaria
        const [[cuenta]] = await conn.query(
          `
    SELECT banco_id
    FROM cuentas_bancarias
    WHERE id = ?
    `,
          [p.cuenta_bancaria_id]
        );

        if (!cuenta) {
          throw new Error("Cuenta bancaria inexistente");
        }

        console.log(cuenta.banco_id)
        console.log(p.fecha)
        console.log("EGRESO")
        console.log(Number(p.monto))
        console.log(`Pago factura compra ${letraCab} ${punto_vta}-${numeroCab}`)
        console.log(p.comprobante)
        console.log(facturaId)


        await conn.execute(
          `
  INSERT INTO movimientos_bancarios
  (
    banco_id,
    fecha,
    tipo,
    monto,
    descripcion,
    referencia,
    user_id
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
          [
            cuenta.banco_id,
            p.fecha ?? fecha,
            "EGRESO",
            Number(p.monto),
            `Pago factura compra ${letraCab} ${punto_vta}-${numeroCab}`,
            p.comprobante ?? null,
            userId
          ]
        );

      }

    }

    /* ======================================================
       8️⃣ ACTUALIZAR SALDO / ESTADO
    ====================================================== */
    const saldoFinal = Number(totalFinal) - totalPagos;
    const estadoFinal =
      saldoFinal <= 0 ? "PAGADA" : totalPagos > 0 ? "PARCIAL" : "PENDIENTE";

    await conn.execute(
      "UPDATE factura_compras SET saldo = ?, estado = ? WHERE id = ?",
      [saldoFinal, estadoFinal, facturaId]
    );







    /* ======================================================
       9️⃣ ACTUALIZAR PV
    ====================================================== */
    await conn.execute(
      "UPDATE puntos_venta SET numero = numero + 1 WHERE id = ?",
      [pv.id]
    );

    return NextResponse.json(
      {
        message: "Factura de compra creada",
        id: facturaId,
        numero: numeroCab,
        punto_vta,
        letra: letraCab,
        total: Number(totalFinal),
        estado: estadoFinal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /facturas-compras error:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear factura de compra" },
      { status: 500 }
    );
  }
}
