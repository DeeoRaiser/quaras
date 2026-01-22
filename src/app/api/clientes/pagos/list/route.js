import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const cliente_id = searchParams.get("cliente_id");
  const numero = searchParams.get("numero");

  /* =============================
     WHERE DINÁMICO
  ============================= */
  const where = {};

  if (cliente_id) {
    where.cliente_id = Number(cliente_id);
  }

  if (numero) {
    where.id = {
      contains: numero
    };
  }

  /* =============================
     PAGOS + RELACIONES
  ============================= */
  const pagos = await prisma.pagos.findMany({
    where,
    orderBy: {
      fecha: "desc"
    },
    select: {
      id: true,
      fecha: true,
      monto: true,
      metodo: true,
      cliente_id: true,
      clientes: {
        select: {
          nombre: true
        }
      },
      aplicaciones_pagos: {
        select: {
          factura_id: true,
          monto_aplicado: true,
          facturas: {
            select: {
              numero: true
            }
          }
        }
      }
    }
  });

  /* =============================
     FORMATEO FINAL (igual al SQL)
  ============================= */
  const resultado = pagos.map(p => ({
    id: p.id,
    fecha: p.fecha,
    monto: p.monto,
    metodo: p.metodo,
    cliente_id: p.cliente_id,
    cliente: p.clientes.nombre,
    aplicaciones: p.aplicaciones_pagos.map(a => ({
      factura_id: a.factura_id,
      monto_aplicado: a.monto_aplicado,
      numero: a.facturas.numero
    }))
  }));

  return NextResponse.json(resultado);
}
