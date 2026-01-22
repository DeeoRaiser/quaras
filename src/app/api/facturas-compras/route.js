import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {  Decimal } from "@prisma/client";

/* ======================================================
  LISTAR FACTURAS DE COMPRAS
====================================================== */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    const puntoVenta = searchParams.get("puntoVenta");
    const numero = searchParams.get("numero");
    const letra = searchParams.get("letra");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");

    const where = {};

    if (puntoVenta) where.punto_vta = puntoVenta;
    if (numero) where.numero = Number(numero);
    if (letra) where.letra = letra;

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(fechaDesde + "T00:00:00");
      if (fechaHasta) where.fecha.lte = new Date(fechaHasta + "T23:59:59");
    }

    const facturas = await prisma.factura_compras.findMany({
      where,
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      include: {
        proveedores: {
          select: { nombre: true }
        }
      }
    });

    return NextResponse.json(
      facturas.map(f => ({
        ...f,
        proveedor_nombre: f.proveedor?.nombre || null
      }))
    );
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
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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
      totalFinal
    } = data;

     console.log("detalle")
    console.log(detalle)

    if (!proveedor_id || !fecha) {
      return NextResponse.json(
        { error: "Proveedor y fecha son obligatorios" },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      /* =========================
        PUNTO DE VENTA
      ========================= */
      const pv = await tx.puntos_venta.findFirst({
        where: { usuario_id: userId }
      });

      if (!pv)
        throw new Error("El usuario no tiene punto de venta configurado");

      const punto_vta = puntoVenta ?? pv.punto_venta;
      const letraCab = letra ?? pv.letra;
      const numeroCab = numero ?? pv.numero + 1;

      /* =========================
        VALIDAR UNICIDAD
      ========================= */
      const existe = await tx.factura_compras.findFirst({
        where: {
          punto_vta,
          letra: letraCab,
          numero: numeroCab
        }
      });

      if (existe)
        throw new Error("Número de comprobante ya existente");

      /* =========================
        CABECERA
      ========================= */
      const factura = await tx.factura_compras.create({
        data: {
          proveedor_id,
          fecha: new Date(fecha),
          numero: numeroCab,
          letra: letraCab,
          punto_vta,
          total: Number(totalFinal),
          saldo: Number(totalFinal),
          estado: "PENDIENTE",
          observacion: observacion || null
        }
      });

      /* =========================
        DETALLE
      ========================= */
      for (const d of detalle) {
        await tx.factura_compra_detalle.create({
          data: {
            factura_id: factura.id,
            articulo_id: d.articulo_id ?? null,
            descripcion: d.descripcion ?? "",
            cantidad: new Decimal(d.cantidad ?? 1),
            precio_compra: new Decimal(d.precio_compra ?? 0),
            ajuste: new Decimal(d.ajuste ?? 0),
            iva: new Decimal(d.iva ?? 0),
            subtotal: new Decimal(d.subtotalLinea ?? 0),
            centro_costo_id: d.centroCosto ?? null
          }
        });
      }

      /* =========================
        IMPUESTOS
      ========================= */
      for (const i of impuestos) {
        await tx.factura_compra_impuestos.create({
          data: {
            factura_id: factura.id,
            impuesto_id: i.impuesto_id,
            codigo: i.codigo,
            nombre: i.nombre,
            alicuota: new Decimal(i.alicuota ?? 0),
            base_imponible: new Decimal(i.base_imponible ?? 0),
            monto: new Decimal(i.monto ?? 0)
          }
        });
      }

      /* =========================
        AJUSTES PIE
      ========================= */
      for (const a of ajustesPie) {
        await tx.factura_compra_ajustes_pie.create({
          data: {
            factura_id: factura.id,
            nombre: a.nombre,
            porcentaje: new Decimal(a.porcentaje ?? 0),
            monto: new Decimal(a.monto ?? 0)
          }
        });
      }

      /* =========================
        PAGOS + MOV. BANCARIOS
      ========================= */
      let totalPagos = 0;

      for (const p of pagos) {
        if (!p.metodo || !p.monto || Number(p.monto) <= 0) continue;

        const pago = await tx.pagos_compras.create({
          data: {
            proveedor_id,
            factura_id: factura.id,
            fecha: new Date(p.fecha ?? fecha),
            metodo: p.metodo,
            monto: Number(p.monto),
            banco: p.banco,
            lote: p.lote,
            cupon: p.cupon,
            tarjeta: p.tarjeta,
            comprobante: p.comprobante,
            observacion: p.observacion
          }
        });

        await tx.aplicaciones_pagos_compras.create({
          data: {
            pago_id: pago.id,
            factura_id: factura.id,
            monto_aplicado: Number(p.monto)
          }
        });

        totalPagos += Number(p.monto);

        if (["TRANSFERENCIA", "CHEQUE_PROPIO", "ECHEQ"].includes(p.metodo)) {
          if (!p.cuenta_bancaria_id)
            throw new Error("Falta cuenta bancaria");

          const cuenta = await tx.cuentas_bancarias.findUnique({
            where: { id: p.cuenta_bancaria_id }
          });

          if (!cuenta)
            throw new Error("Cuenta bancaria inexistente");

          await tx.movimientos_bancarios.create({
            data: {
              banco_id: cuenta.banco_id,
              fecha: new Date(p.fecha ?? fecha),
              tipo: "EGRESO",
              monto: Number(p.monto),
              descripcion: `Pago factura compra ${letraCab} ${punto_vta}-${numeroCab}`,
              referencia: p.comprobante ?? null,
              user_id: userId
            }
          });
        }
      }

      /* =========================
        ACTUALIZAR FACTURA
      ========================= */
      const saldoFinal = Number(totalFinal) - totalPagos;
      const estadoFinal =
        saldoFinal <= 0 ? "PAGADA" : totalPagos > 0 ? "PARCIAL" : "PENDIENTE";

      await tx.factura_compras.update({
        where: { id: factura.id },
        data: {
          saldo: saldoFinal,
          estado: estadoFinal
        }
      });

      /* =========================
        ACTUALIZAR PV
      ========================= */
      await tx.puntos_venta.update({
        where: { id: pv.id },
        data: { numero: { increment: 1 } }
      });

      return NextResponse.json(
        {
          message: "Factura de compra creada",
          id: factura.id,
          numero: numeroCab,
          punto_vta,
          letra: letraCab,
          total: Number(totalFinal),
          estado: estadoFinal
        },
        { status: 201 }
      );
    });

  } catch (error) {
    console.error("POST /facturas-compras error:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear factura de compra" },
      { status: 500 }
    );
  }
}
