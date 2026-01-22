import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const where = {
      ...(puntoVenta && { punto_vta: Number(puntoVenta) }),
      ...(letra && { letra }),
      ...(numero && { numero: Number(numero) }),
      ...((fechaDesde || fechaHasta) && {
        fecha: {
          ...(fechaDesde && { gte: new Date(`${fechaDesde}T00:00:00`) }),
          ...(fechaHasta && { lte: new Date(`${fechaHasta}T23:59:59`) }),
        },
      }),
    };

    const facturas = await prisma.facturas.findMany({
      where,
      include: {
        clientes: {
          select: { nombre: true },
        },
      },
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
    });

    // compatibilidad con tu SELECT anterior
    const result = facturas.map(f => ({
      ...f,
      cliente_nombre: f.clientes?.nombre || null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /facturas error:", error);
    return NextResponse.json(
      { error: "Error al obtener facturas" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const userId = session.user.id;
    const data = await req.json();

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
      saldo: saldoCalculado,
      estado: estadoCalculado,
    } = data;

    if (!cliente_id || !fecha) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async tx => {
      // 1️⃣ Punto de venta
      const pv = await tx.puntos_venta.findFirst({
        where: { usuario_id: userId },
      });

      if (!pv)
        throw new Error("El usuario no tiene punto de venta configurado");

      const punto_vta = puntoVenta ?? pv.punto_venta;
      const letraCab = letra ?? pv.letra;
      const numeroCab = numero ?? pv.numero + 1;

      // 2️⃣ Unicidad
      const exists = await tx.facturas.findFirst({
        where: {
          punto_vta,
          letra: letraCab,
          numero: numeroCab,
        },
        select: { id: true },
      });

      if (exists)
        throw new Error("Número de comprobante ya existente");

      // 3️⃣ Factura
      const factura = await tx.facturas.create({
        data: {
          cliente_id,
          fecha: new Date(fecha),
          numero: numeroCab,
          letra: letraCab,
          punto_vta,
          total: Number(totalFinal),
          estado: estadoCalculado || "PENDIENTE",
          observacion,
          saldo: Number(saldoCalculado),
        },
      });

      // 4️⃣ Detalle
      for (const it of detalle) {
        const subtotal =
          it.subtotal ??
          Number(it.cantidad) * Number(it.precio_venta) *
            (1 + Number(it.ajuste || 0) / 100);

        await tx.factura_detalle.create({
          data: {
            factura_id: factura.id,
            articulo_id: it.articulo_id,
            descripcion: it.descripcion,
            cantidad: it.cantidad,
            precio_venta: it.precio_venta,
            ajuste: it.ajuste,
            iva: it.iva,
            subtotal,
            centro_costo_id: it.centroCosto,
          },
        });
      }

      // 5️⃣ Impuestos
      for (const imp of impuestos) {
        await tx.factura_venta_impuestos.create({
          data: {
            factura_id: factura.id,
            impuesto_id: imp.impuesto_id,
            codigo: imp.codigo,
            nombre: imp.nombre,
            alicuota: imp.alicuota,
            base_imponible: Number(imp.base_imponible),
            monto: Number(imp.monto),
          },
        });
      }

      // 6️⃣ Ajustes pie
      for (const aj of ajustesPie) {
        await tx.factura_ajustes_pie.create({
          data: {
            factura_id: factura.id,
            nombre: aj.nombre,
            porcentaje: Number(aj.porcentaje),
            monto: Number(aj.monto),
          },
        });
      }

      // 7️⃣ Pagos
      let totalPagos = 0;

      for (const p of pagos) {
        if (!p.metodo || Number(p.monto) <= 0) continue;

        const pago = await tx.pagos.create({
          data: {
            cliente_id,
            factura_id: factura.id,
            metodo: p.metodo,
            monto: Number(p.monto),
            comprobante: p.comprobante,
            banco: p.banco,
            lote: p.lote,
            cupon: p.cupon,
            tarjeta: p.tarjeta,
            fecha: p.fecha ? new Date(p.fecha) : new Date(fecha),
            observacion: p.observacion,
          },
        });

        await tx.aplicaciones_pagos.create({
          data: {
            pago_id: pago.id,
            factura_id: factura.id,
            monto_aplicado: Number(p.monto),
          },
        });

        totalPagos += Number(p.monto);

        if (
          ["TRANSFERENCIA", "CHEQUE_PROPIO", "ECHEQ"].includes(p.metodo)
        ) {
          const cuenta = await tx.cuentas_bancarias.findUnique({
            where: { id: p.cuenta_bancaria_id },
            select: { banco_id: true },
          });

          if (!cuenta)
            throw new Error("Cuenta bancaria inexistente");

          await tx.movimientos_bancarios.create({
            data: {
              banco_id: cuenta.banco_id,
              fecha: p.fecha ? new Date(p.fecha) : new Date(fecha),
              tipo: "INGRESO",
              monto: Number(p.monto),
              descripcion: `Venta factura ${letraCab} ${punto_vta}-${numeroCab}`,
              referencia: p.comprobante,
              user_id: userId,
               pago_venta_id: pago.id,
            },
          });
        }
      }

      // 8️⃣ Estado final
      const saldoFinal = Number(totalFinal) - totalPagos;
      const estadoFinal =
        saldoFinal <= 0
          ? "PAGADA"
          : saldoFinal < Number(totalFinal)
          ? "PARCIAL"
          : "PENDIENTE";

      await tx.facturas.update({
        where: { id: factura.id },
        data: { saldo: saldoFinal, estado: estadoFinal },
      });

      // 9️⃣ Incrementar PV
      await tx.puntos_venta.update({
        where: { id: pv.id },
        data: { numero: { increment: 1 } },
      });

      return {
        factura,
        estadoFinal,
        punto_vta,
        numeroCab,
        letraCab,
      };
    });

    return NextResponse.json(
      {
        message: "Factura creada",
        id: result.factura.id,
        numero: result.numeroCab,
        punto_vta: result.punto_vta,
        letra: result.letraCab,
        total: Number(totalFinal),
        estado: result.estadoFinal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /facturas error:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear factura" },
      { status: 500 }
    );
  }
}


