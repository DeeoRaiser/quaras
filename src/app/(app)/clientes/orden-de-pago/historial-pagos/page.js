"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    TextField,
    Autocomplete,
} from "@mui/material";

import dayjs from "dayjs";
import { ListItemButton } from "@mui/material";
import ModalFactura from "@/components/facturas-ventas/modales/ModalFactura";

export default function PagosPage() {
    const [pagos, setPagos] = useState([]);
    const [pagosFiltrados, setPagosFiltrados] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [selected, setSelected] = useState(null);

    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

    const [openFactura, setOpenFactura] = useState(false);


    const [filters, setFilters] = useState({
        cliente_id: "",
        numero: "",
    });

    const abrirFactura = async (facturaId) => {
        try {
            const res = await fetch(`/api/facturas-ventas/${facturaId}`);
            const json = await res.json();
            setFacturaSeleccionada(json);
            setOpenFactura(true);
        } catch (err) {
            console.error(err);
            alert("Error al cargar factura");
        }
    };


    /* =============================
       CARGA INICIAL
    ============================= */
    const loadPagos = async () => {
        const res = await fetch("/api/pagos/list");
        const json = await res.json();
        setPagos(json);
        setPagosFiltrados(json);
    };

    const loadClientes = async () => {
        const res = await fetch("/api/clientes");
        const json = await res.json();
        setClientes(json);
    };

    useEffect(() => {
        loadPagos();
        loadClientes();
    }, []);

    /* =============================
       BUSCAR
    ============================= */
    const buscar = () => {
        let data = [...pagos];

        if (filters.cliente_id) {
            data = data.filter(p => p.cliente_id === filters.cliente_id);
        }

        if (filters.numero) {
            data = data.filter(p =>
                String(p.id).includes(filters.numero)
            );
        }

        setPagosFiltrados(data);
    };

    /* =============================
       ELIMINAR
    ============================= */
    const eliminarPago = async () => {
        if (!confirm("¿Eliminar este pago? Esta acción no se puede deshacer")) return;

        const res = await fetch(`/api/pagos/delete/${selected.id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            alert("Error al eliminar pago");
            return;
        }

        setSelected(null);
        loadPagos();
    };



    return (
        <Box p={2}>
            <Typography variant="h5" mb={2}>
                Ordenes de Pago Clientes
            </Typography>

            {/* =============================
               FILTROS
            ============================= */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Autocomplete
                        sx={{ flex: "1 1 250px" }}
                        options={clientes}
                        getOptionLabel={(c) => c.nombre || ""}
                        onChange={(_, value) =>
                            setFilters({
                                ...filters,
                                cliente_id: value?.id || "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField {...params} label="Cliente" />
                        )}
                    />

                    <TextField
                        label="N° Comprobante"
                        value={filters.numero}
                        onChange={(e) =>
                            setFilters({ ...filters, numero: e.target.value })
                        }
                    />

                    <Button variant="contained" onClick={buscar}>
                        Buscar
                    </Button>
                </Box>
            </Paper>

            {/* =============================
               LISTADO
            ============================= */}
            {pagosFiltrados.map(p => (
                <Paper
                    key={p.id}
                    sx={{ p: 2, mb: 1, cursor: "pointer" }}
                    onClick={() => setSelected(p)}
                >
                    <Typography>
                        Pago #{p.id} — {dayjs(p.fecha).format("DD/MM/YYYY")} — ${p.monto}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Cliente: {p.cliente}
                    </Typography>
                </Paper>
            ))}

            {/* =============================
               DETALLE
            ============================= */}
            <Dialog
                open={!!selected}
                onClose={() => setSelected(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Detalle del Pago</DialogTitle>
                <DialogContent>
                    {selected && (
                        <>
                            <Typography>
                                Cliente: {selected.cliente}
                            </Typography>
                            <Typography>
                                Método: {selected.metodo}
                            </Typography>

                            <Typography mt={2} fontWeight="bold">
                                Aplicado a:
                            </Typography>

                            <List>
                                {selected.aplicaciones.map(a => (
                                    <ListItem key={a.factura_id} disablePadding>
                                        <ListItemButton onClick={() => abrirFactura(a.factura_id)}>
                                            <ListItemText
                                                primary={`Factura ${a.numero} - ${a.numero} - ${a.letra}`}
                                                secondary={`Monto aplicado: $${a.monto_aplicado}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setSelected(null)}>
                        Cerrar
                    </Button>
                    <Button color="error" onClick={eliminarPago}>
                        Eliminar Pago
                    </Button>
                </DialogActions>
            </Dialog>
            <ModalFactura
                open={openFactura}
                onClose={() => setOpenFactura(false)}
                factura={facturaSeleccionada}
                pagos={pagos}
            />
        </Box>
    );
}
