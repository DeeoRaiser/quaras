"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Backdrop,
} from "@mui/material";

import CrudTableFacturas from "@/components/facturas-compras/CrudTableFacturas";
import ModalFactura from "@/components/facturas-compras/modales/ModalFactura";
import PagoModal from "@/components/facturas-compras/modales/PagoModal";

export default function cuentaCorriente({ title }) {
  const [filters, setFilters] = useState({
    proveedor_id: "",
    estado: "TODAS",
    fechaDesde: "",
    fechaHasta: ""
  });

  const [proveedores, setProveedores] = useState([]);
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
    const loadProveedores = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/proveedores");
        const json = await res.json();
        setProveedores(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProveedores();
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

  /* =============================
     VER DETALLE FACTURA
  ============================= */
  const onVerDetalle = async (factura) => {
    setLoading(true);
    setFacturaSeleccionada(factura);

    try {
      const resp = await fetch(`/api/facturas-compras/${factura.id}`);
      const json = await resp.json();

      setDetalle(json.detalle || []);
      setPagos(json.pagos || []);
      setCliente({
         proveedor_CUIT: json.proveedor_CUIT,
      proveedor_id: json.proveedor,
      proveedor: json.proveedor
      });

      setOpenDetalle(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={2}>
      <h2>{title}</h2>

      ⚙️ Opciones de búsqueda
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {/* CLIENTE */}
          <Autocomplete
            sx={{ flex: "1 1 250px" }}
            options={proveedores}
            getOptionLabel={(c) =>
              `${c.nombre}`.trim()
            }
            onChange={(_, value) =>
              setFilters({
                ...filters,
                proveedor_id: value?.id || "",
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="Proveedor" />
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

      {/* MODALES */}
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
        onGuardado={buscar}
      />

      {/* SPINNER GLOBAL */}
      <Backdrop
        open={loading}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
