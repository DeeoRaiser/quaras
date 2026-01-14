"use client";

import { useState } from "react";
import { Box, TextField, Button, Paper, MenuItem } from "@mui/material";

import CrudTableFacturas from "@/components/facturas-ventas/CrudTableFacturas";
import ModalFactura from "./modales/ModalFactura";
import PagoModal from "./modales/PagoModal";

const letras = ["A", "B"];

export default function FacturasPage({ title }) {
  const [filters, setFilters] = useState({
    puntoVenta: "",
    numero: "",
    letra: "",
    fechaDesde: "",
    fechaHasta: ""
  });

  const [data, setData] = useState([]);

 
  // Modal
  const [openDetalle, setOpenDetalle] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [pagoModalOpen, setPagoModalOpen] = useState(false);

  const abrirPago = (factura) => {
    setFacturaSeleccionada(factura);
    setPagoModalOpen(true);
  };

  const buscar = async () => {
    const res = await fetch("/api/facturas-ventas/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    setData(await res.json());
  };

  const onVerDetalle = async (factura) => {
    setFacturaSeleccionada(factura);
    const resp = await fetch(`/api/facturas-ventas/${factura.id}`);
    const json = await resp.json();

    setDetalle(json.detalle || []);
    setPagos(json.pagos || []);
    setCliente({
      cliente_dni: json.cliente_dni,
      cliente_id: json.cliente_id,
      cliente_nombre: json.cliente_nombre
    } || null);

    setOpenDetalle(true);
  };

  return (
    <Box p={2}>
      <h2>{title}</h2>

      ⚙️ Opciones de búsqueda
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >

          <TextField
            sx={{ flex: "1 1 100px" }}
            label="Punto Venta"
            type="number"
            value={filters.puntoVenta}
            onChange={(e) =>
              setFilters({ ...filters, puntoVenta: e.target.value })
            }
          />

          <TextField
            sx={{ flex: "1 1 100px" }}
            label="Número"
            type="number"
            value={filters.numero}
            onChange={(e) =>
              setFilters({ ...filters, numero: e.target.value })
            }
          />

          <TextField
            sx={{ flex: "1 1 30px" }}
            select
            label="Letra"
            value={filters.letra}
            onChange={(e) =>
              setFilters({ ...filters, letra: e.target.value })
            }
          >
            {letras.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            sx={{ flex: "1 1 100px" }}
            label="Fecha Desde"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.fechaDesde}
            onChange={(e) =>
              setFilters({ ...filters, fechaDesde: e.target.value })
            }
          />

          <TextField
            sx={{ flex: "1 1 100px" }}
            label="Fecha Hasta"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.fechaHasta}
            onChange={(e) =>
              setFilters({ ...filters, fechaHasta: e.target.value })
            }
          />

          <Box sx={{ flex: "1 1 100px" }}>
            <Button variant="contained" onClick={buscar}>
              Buscar
            </Button>
          </Box>

        </Box>
      </Paper>

      {/* TABLA */}
      <CrudTableFacturas
        data={data}
        verDetalle={onVerDetalle}
        onAgregarPago={abrirPago}
      />

      {/* MODAL */}
      <ModalFactura
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
        factura={facturaSeleccionada}
        cliente={cliente}
        detalle={detalle}
        pagos={pagos}
      />

      <PagoModal
        open={pagoModalOpen}
        onClose={() => setPagoModalOpen(false)}
        factura={facturaSeleccionada}
        onGuardado={() => buscar()}
      />




    </Box>


  );
}
