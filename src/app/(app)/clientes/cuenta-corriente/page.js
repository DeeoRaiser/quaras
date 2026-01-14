"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  MenuItem,
  Autocomplete
} from "@mui/material";

import CrudTableFacturas from "@/components/facturas-ventas/CrudTableFacturas";
import ModalFactura from "@/components/facturas-ventas/modales/ModalFactura";
import PagoModal from "@/components/facturas-ventas/modales/PagoModal";
import { CircularProgress, Backdrop } from "@mui/material";



export default function FacturasPage({ title }) {
  const [filters, setFilters] = useState({
    cliente_id: "",
    estado: "TODAS", // TODAS | PENDIENTES
    fechaDesde: "",
    fechaHasta: ""
  });

  const [clientes, setClientes] = useState([]);
  const [data, setData] = useState([]);

  // Modales
  const [openDetalle, setOpenDetalle] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [pagoModalOpen, setPagoModalOpen] = useState(false);

const [loading, setLoading] = useState(false);

  
  /* =============================
     CARGAR CLIENTES
  ============================= */
  useEffect(() => {
    fetch("/api/clientes")
      .then(res => res.json())
      .then(setClientes)
      .catch(console.error);
  }, []);

  const abrirPago = (factura) => {
    setFacturaSeleccionada(factura);
    setPagoModalOpen(true);
  };

  /* =============================
     BUSCAR FACTURAS
  ============================= */
const buscar = async () => {
  setLoading(true);

  try {
    const res = await fetch("/api/facturas-ventas/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
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

    const resp = await fetch(`/api/facturas-ventas/${factura.id}`);
    const json = await resp.json();

    setDetalle(json.detalle || []);
    setPagos(json.pagos || []);
    setCliente({
      cliente_id: json.cliente_id,
      cliente_nombre: json.cliente_nombre,
      cliente_dni: json.cliente_dni
    });

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
          {/* CLIENTE */}
          <Autocomplete
            sx={{ flex: "1 1 250px" }}
            options={clientes}
            getOptionLabel={(c) =>
              `${c.nombre} ${c.apellido ?? ""}`.trim()
            }
            onChange={(_, value) =>
              setFilters({
                ...filters,
                cliente_id: value?.id || ""
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="Cliente" />
            )}
          />

          {/* ESTADO */}
          <TextField
            sx={{ flex: "1 1 150px" }}
            select
            label="Estado"
            value={filters.estado}
            onChange={(e) =>
              setFilters({ ...filters, estado: e.target.value })
            }
          >
            <MenuItem value="TODAS">Todas</MenuItem>
            <MenuItem value="PAGADA">Pagadas</MenuItem>
            <MenuItem value="PENDIENTE">Pendientes</MenuItem>
          </TextField>

          {/* FECHAS */}
          <TextField
            sx={{ flex: "1 1 150px" }}
            label="Fecha Desde"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.fechaDesde}
            onChange={(e) =>
              setFilters({ ...filters, fechaDesde: e.target.value })
            }
          />

          <TextField
            sx={{ flex: "1 1 150px" }}
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

      
      <Backdrop
  open={loading}
  sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
>
  <CircularProgress color="inherit" />
</Backdrop>

    </Box>
  );
}
