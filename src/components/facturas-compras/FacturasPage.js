"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  MenuItem,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import CrudTableFacturas from "@/components/facturas-compras/CrudTableFacturas";
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
  const [loading, setLoading] = useState(false);

  // Modales
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

  /* =============================
     BUSCAR FACTURAS (CON SPINNER)
  ============================= */
  const buscar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/facturas-compras/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onVerDetalle = async (factura) => {
    setFacturaSeleccionada(factura);

    const resp = await fetch(`/api/facturas-compras/${factura.id}`);
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
            sx={{ flex: "1 1 60px" }}
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
            sx={{ flex: "1 1 140px" }}
            label="Fecha Desde"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.fechaDesde}
            onChange={(e) =>
              setFilters({ ...filters, fechaDesde: e.target.value })
            }
          />

          <TextField
            sx={{ flex: "1 1 140px" }}
            label="Fecha Hasta"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.fechaHasta}
            onChange={(e) =>
              setFilters({ ...filters, fechaHasta: e.target.value })
            }
          />

          <Box sx={{ flex: "1 1 120px" }}>
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

      {/* MODAL DETALLE */}
      <ModalFactura
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
        factura={facturaSeleccionada}
        cliente={cliente}
        detalle={detalle}
        pagos={pagos}
      />

      {/* MODAL PAGO */}
      <PagoModal
        open={pagoModalOpen}
        onClose={() => setPagoModalOpen(false)}
        factura={facturaSeleccionada}
        onGuardado={() => buscar()}
      />

      {/* 🔄 SPINNER GLOBAL */}
      <Backdrop
        open={loading}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
