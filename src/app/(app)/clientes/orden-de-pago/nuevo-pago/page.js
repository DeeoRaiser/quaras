"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Button,
    Autocomplete,
    TextField,
    MenuItem,
    Backdrop,
    CircularProgress,
} from "@mui/material";

import CrudTableFacturas from "@/components/facturas-ventas/CrudTableFacturas";
import AplicarPagoModal from "@/components/facturas-ventas/modales/AplicarPagoModal";

export default function CuentaCorrientePage({
    title = "Cuenta Corriente",
    tipo = "CLIENTE", // CLIENTE | PROVEEDOR
}) {
    const [entidades, setEntidades] = useState([]);
    const [filters, setFilters] = useState({
        entidad_id: "",
        estado: "PENDIENTE",
    });

    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openPago, setOpenPago] = useState(false);

    /* =============================
       ENDPOINTS DINÁMICOS
    ============================= */
    const endpoints = {
        CLIENTE: {
            entidades: "/api/clientes",
            facturas: "/api/facturas-ventas/list",
        },
        PROVEEDOR: {
            entidades: "/api/proveedores",
            facturas: "/api/facturas-compras/list",
        },
    };

    /* =============================
       CARGAR CLIENTES / PROVEEDORES
    ============================= */
    useEffect(() => {
        const loadEntidades = async () => {
            setLoading(true);
            try {
                const res = await fetch(endpoints[tipo].entidades);
                const json = await res.json();
                setEntidades(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadEntidades();
    }, [tipo]);

    /* =============================
       BUSCAR FACTURAS
    ============================= */
    const buscar = async () => {
        setLoading(true);
        try {
            const res = await fetch(endpoints[tipo].facturas, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...filters,
                    estado: filters.estado === "TODAS" ? undefined : filters.estado,
                }),
            });

            const json = await res.json();
            setFacturas(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={2}>
            <h2>{title}</h2>

            {/* =============================
          FILTROS
      ============================= */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Autocomplete
                        sx={{ flex: "1 1 250px" }}
                        options={entidades}
                        getOptionLabel={(e) => e.nombre || ""}
                        onChange={(_, value) =>
                            setFilters({
                                ...filters,
                                entidad_id: value?.id || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={tipo === "CLIENTE" ? "Cliente" : "Proveedor"}
                            />
                        )}
                    />

                    <TextField
                        sx={{ width: 180 }}
                        select
                        label="Estado"
                        value={filters.estado}
                        onChange={(e) =>
                            setFilters({ ...filters, estado: e.target.value })
                        }
                    >
                        <MenuItem value="PENDIENTE">Pendientes</MenuItem>
                        <MenuItem value="PARCIAL">Parciales</MenuItem>
                        <MenuItem value="PAGADA">Pagadas</MenuItem>
                        <MenuItem value="TODAS">Todas</MenuItem>
                    </TextField>

                    <Button variant="contained" onClick={buscar}>
                        Buscar
                    </Button>

                    <Button
                        variant="outlined"
                        color="success"
                        onClick={() => setOpenPago(true)}
                        disabled={!filters.entidad_id}
                    >
                        Aplicar Pago
                    </Button>
                </Box>
            </Paper>

            {/* =============================
          TABLA FACTURAS
      ============================= */}
            <CrudTableFacturas data={facturas} />

            {/* =============================
          MODAL APLICAR PAGO
      ============================= */}
<AplicarPagoModal
    open={openPago}
    onClose={() => setOpenPago(false)}
    entidadId={filters.entidad_id}
    facturas={facturas.filter(f => Number(f.saldoPendiente) > 0)}
    onConfirmar={() => {
        setOpenPago(false);
        buscar();
    }}
/>


            {/* =============================
          SPINNER GLOBAL
      ============================= */}
            <Backdrop
                open={loading}
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
