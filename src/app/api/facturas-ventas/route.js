import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    const puntoVenta = searchParams.get("puntoVenta");
    const numero = searchParams.get("numero");
    const letra = searchParams.get("letra");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");

    let query = `
      SELECT f.*, c.nombre AS cliente_nombre
      FROM facturas f
      LEFT JOIN clientes c ON c.id = f.cliente_id
      WHERE 1=1
    `;

    const params = [];

    if (puntoVenta) {
      query += " AND f.puntoVenta = ?";
      params.push(puntoVenta);
    }

    if (letra) {
      query += " AND f.letra = ?";
      params.push(letra);
    }

    if (numero) {
      query += " AND f.numero = ?";
      params.push(numero);
    }

    if (fechaDesde) {
      query += " AND f.fecha >= ?";
      params.push(fechaDesde + " 00:00:00");
    }

    if (fechaHasta) {
      query += " AND f.fecha <= ?";
      params.push(fechaHasta + " 23:59:59");
    }

    query += `
      ORDER BY f.fecha DESC, f.id DESC
    `;

    const conn = await getConnection();
    const [rows] = await conn.query(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /facturas error:", error);
    return NextResponse.json({ error: "Error al obtener facturas" }, { status: 500 });
  }
}

// Crear factura (y detalle + pagos opcionales)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const userId = session.user.id;
    const data = await req.json();

    // Tomar todos los datos de frontend (ya calculados previamente en FE)
    const {
      cliente_id,
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
      totalIVA,
      totalImpuestos,
      totalAjustesPie,
      saldo: saldoCalculado, // frontend calcula saldo
      estado: estadoCalculado, // frontend calcula estado
    } = data;


    console.log("data")
    console.log(data)

    if (!cliente_id || !fecha) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const conn = await getConnection();

    // ============================================================
    // 1. OBTENER PUNTO DE VENTA DEL USUARIO
    // ============================================================
    const [pvRows] = await conn.query(
      "SELECT id, punto_venta, letra, numero FROM puntos_venta WHERE usuario_id = ? LIMIT 1",
      [userId]
    );
    if (pvRows.length === 0) {
      return NextResponse.json({ error: "El usuario no tiene punto de venta configurado" }, { status: 400 });
    }
    const puntoVentaRow = pvRows[0];
    const punto_vta = puntoVentaRow.punto_venta;
    // Siempre usar los datos enviados por el frontend (para multi PV), pero si no vienen, tomar del usuario
    const letraCab = letra ?? puntoVentaRow.letra;
    const numeroCab = numero ?? (puntoVentaRow.numero + 1);

    // ============================================================
    // 2. VERIFICAR UNICIDAD DEL COMPROBANTE
    // ============================================================
    const [exists] = await conn.query(
      "SELECT id FROM facturas WHERE punto_vta = ? AND letra = ? AND numero = ? LIMIT 1",
      [punto_vta, letraCab, numeroCab]
    );
    if (exists.length > 0) {
      return NextResponse.json({
        error: "Número de comprobante ya existente, contactar soporte"
      }, { status: 400 });
    }

    // ============================================================
    // 3. INSERTAR CABECERA DE FACTURA
    // ============================================================
    // Grabar CABECERA con el totalFinal y saldo calculados por el FE
    const [res] = await conn.execute(
      `INSERT INTO facturas (cliente_id, fecha, numero, letra, punto_vta, total, estado, observacion, saldo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente_id,
        fecha,
        numeroCab,
        letraCab,
        punto_vta,
        Number(totalFinal), // totalFinal incluye todo (bases, ajustes, iva, impuestos)
        estadoCalculado || "PENDIENTE",
        observacion || null,
        Number(saldoCalculado),
      ]
    );
    const facturaId = res.insertId;

    // ============================================================
    // 4. INSERTAR DETALLE
    // Cada línea viene ya con precio_venta, cantidad, ajuste, iva y subtotal calculado en FE
    for (const it of detalle) {
      const {
        articulo_id = null,
        descripcion = "",
        cantidad = 1,
        precio_venta = 0,
        ajuste = 0,
        iva = 21,
        subtotal = null, 
        centroCosto,     // subtotal debe ser el total de la línea incluido ajuste individual (IVA incluido)
      } = it;
      const calcSubtotal = subtotal !== null
        ? Number(subtotal)
        : (Number(cantidad) * Number(precio_venta)) + ((Number(cantidad) * Number(precio_venta)) * Number(ajuste)/100);

      await conn.execute(
        `INSERT INTO factura_detalle 
          (factura_id, articulo_id, descripcion, cantidad, precio_venta, ajuste, iva, subtotal, centro_costo_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          facturaId,
          articulo_id,
          descripcion,
          cantidad,
          precio_venta,
          ajuste,
          iva,
          calcSubtotal,
          centroCosto
        ]
      );
    }

    // ============================================================
    // 5. INSERTAR IMPUESTOS DISCRIMINADOS (factura_venta_impuestos)
    // ============================================================
    if (Array.isArray(impuestos) && impuestos.length > 0) {
      for (const imp of impuestos) {
        const {
          impuesto_id = null,
          codigo = null,
          nombre = null,
          alicuota = null,
          base_imponible = 0,
          monto = 0
        } = imp;
        await conn.execute(
          `INSERT INTO factura_venta_impuestos 
          (factura_id, impuesto_id, codigo, nombre, alicuota, base_imponible, monto)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            facturaId,
            impuesto_id,
            codigo ?? null,
            nombre ?? null,
            alicuota ?? null,
            Number(base_imponible),
            Number(monto)
          ]
        );
      }
    }

    // ============================================================
    // 6.1 INSERTAR AJUSTES PIE (factura_ajustes_pie)
    // ============================================================
    if (Array.isArray(ajustesPie) && ajustesPie.length > 0) {
      for (const aj of ajustesPie) {
        const {
          nombre = null,
          porcentaje = 0,
          monto = 0
        } = aj;
        await conn.execute(
          `INSERT INTO factura_ajustes_pie 
          (factura_id, nombre, porcentaje, monto)
         VALUES (?, ?, ?, ?)`,
          [
            facturaId,
            nombre ?? null,
            Number(porcentaje),
            Number(monto)
          ]
        );
      }
    }

   // ============================================================
// 7. INSERTAR PAGOS (MISMA LÓGICA QUE API /pagos)
// ============================================================
let totalPagosApplied = 0;

console.log("pagos")
console.log(pagos)

if (Array.isArray(pagos) && pagos.length > 0) {
  console.log("entre pagos es array")
  for (const p of pagos) {
    console.log("for !")
    const {
      metodo,
      monto,
      comprobante = null,
      banco = null,
      lote = null,
      cupon = null,
      tarjeta = null,
      fecha: fechaPago = null,
      observacion: obsPago = null
    } = p;

    if (!metodo) continue;
    if (!monto || Number(monto) <= 0) continue;

    // 1️⃣ Insertar pago
    const [pRes] = await conn.execute(
      `
      INSERT INTO pagos (
        cliente_id,
        factura_id,
        metodo,
        monto,
        comprobante,
        banco,
        lote,
        cupon,
        tarjeta,
        fecha,
        observacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cliente_id,
        facturaId,
        metodo,
        Number(monto),
        comprobante,
        banco,
        lote,
        cupon,
        tarjeta,
        fechaPago ?? fecha,
        obsPago
      ]
    );

    const pagoId = pRes.insertId;

    // 2️⃣ Aplicar pago
    await conn.execute(
      `
      INSERT INTO aplicaciones_pagos (
        pago_id,
        factura_id,
        monto_aplicado,
        created_at
      ) VALUES (?, ?, ?, NOW())
      `,
      [pagoId, facturaId, Number(monto)]
    );

    totalPagosApplied += Number(monto);

    
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
            "INGRESO",
            Number(p.monto),
            `Venta factura ${letraCab} ${punto_vta}-${numeroCab}`,
            p.comprobante ?? null,
            userId
          ]
        );

      }

    }


}

 
// ============================================================
// 8. ACTUALIZAR ESTADO / SALDO
// ============================================================
const saldoFinal = Number(totalFinal) - totalPagosApplied;

let estadoFinal = "PENDIENTE";
if (saldoFinal <= 0) estadoFinal = "PAGADA";
else if (saldoFinal < Number(totalFinal)) estadoFinal = "PARCIAL";

await conn.execute(
  "UPDATE facturas SET saldo = ?, estado = ? WHERE id = ?",
  [saldoFinal, estadoFinal, facturaId]
);


    // ============================================================
    // 9. ACTUALIZAR NÚMERO DEL PV (SÓLO si hiciste un comprobante nuevo)
    // ============================================================
    await conn.execute(
      "UPDATE puntos_venta SET numero = numero + 1 WHERE id = ?",
      [puntoVentaRow.id]
    );

    return NextResponse.json({
      message: "Factura creada",
      id: facturaId,
      numero: numeroCab,
      punto_vta,
      letra: letraCab,
      total: Number(totalFinal),
      estado: estadoFinal
    }, { status: 201 });

  } catch (error) {
    console.error("POST /facturas error:", error);
    return NextResponse.json({ error: error?.message || "Error al crear factura" }, { status: 500 });
  }
}