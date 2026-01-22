"use client";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
    Divider, Table, TableHead, TableRow, TableCell, TableBody, Box, Tabs, Tab
} from "@mui/material";

import { useState } from "react";
import dayjs from "dayjs";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaidIcon from "@mui/icons-material/Paid";
import PercentIcon from "@mui/icons-material/Percent";

export default function ModalFactura({
    open,
    onClose,
    factura,
}) {
    if (!factura) return null;

    console.log("factura")
    console.log(factura)

    // Para no romper si faltan
    const detalle = factura.detalle || [];
    const pagos = factura.pagos || [];
    const proveedorNombre = factura.proveedor_nombre || '';
    const proveedorCUIT = factura.proveedor_cuit || '';

    const nroCompleto = `${String(factura.punto_vta).padStart(4, "0")}-${String(factura.numero).padStart(8, "0")}-${factura.letra}`;

    const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto_aplicado), 0);
    const saldoPendiente = Number(factura.totalFactura) - totalPagado;
    const [tab, setTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };
    
    // Formateo numérico seguro
    const fmt = num => Number(num).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                {/* IZQUIERDA */}
                                <Box>
                                    Factura {nroCompleto}
                                </Box>
            
                                {/* DERECHA */}
                                <Box>
                                    Fecha {dayjs(factura.fecha).format("DD-MM-YYYY")}
                                </Box>
                            </Box>
                        </DialogTitle>
            <DialogContent dividers>
                {/* CLIENTE */}
                <Typography variant="h6">Datos del Proveedor</Typography>
                <Typography>Nombre: {proveedorNombre}</Typography>
                <Typography>CUIT: {proveedorCUIT}</Typography>

                <Divider sx={{ my: 2 }} />

                {/* DETALLE */}
                <Typography variant="h6">Detalle de Productos</Typography>
                <Table size="small" sx={{ mb: 2 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell>Cant.</TableCell>
                            <TableCell>Precio</TableCell>
                            <TableCell>Ajuste</TableCell>
                            <TableCell>IVA</TableCell>
                            <TableCell>Subtotal</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detalle.map((d) => (
                            <TableRow key={d.id}>
                                <TableCell>{d.descripcion}</TableCell>
                                <TableCell>{d.cantidad}</TableCell>
                                <TableCell>${fmt(d.precio_compra)}</TableCell>
                                <TableCell>{d.ajuste ? `${d.ajuste}%` : "0%"}</TableCell>
                                <TableCell>{d.iva}%</TableCell>
                                <TableCell>${fmt(d.subtotal)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Divider sx={{ my: 2 }} />



                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    sx={{ mb: 2 }}
                >
                    <Tab label="Impuestos" icon=<AccountBalanceIcon /> />
                    <Tab label="Ajustes Pie" icon=<PercentIcon /> />
                    <Tab label="Pagos" icon=<PaidIcon /> />
                </Tabs>


                {tab === 0 && (
                    <>
                        <Typography variant="h6">Impuestos Discriminados</Typography>

                        {!factura.impuestos || factura.impuestos.length === 0 ? (
                            <Typography>No se aplicaron impuestos adicionales.</Typography>
                        ) : (
                            <Table size="small" sx={{ my: 1 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Impuesto</TableCell>
                                        <TableCell>Alicuota</TableCell>
                                        <TableCell>Base</TableCell>
                                        <TableCell>Monto</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {factura.impuestos.map((imp) => (
                                        <TableRow key={imp.id}>
                                            <TableCell>{imp.nombre || imp.codigo}</TableCell>
                                            <TableCell>{imp.alicuota}%</TableCell>
                                            <TableCell>${fmt(imp.base_imponible)}</TableCell>
                                            <TableCell>${fmt(imp.monto)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </>
                )}
                {tab === 1 && (
                    <>
                        <Typography variant="h6">Ajustes del Pie</Typography>

                        {!factura.ajustesPie || factura.ajustesPie.length === 0 ? (
                            <Typography>No hay ajustes en el pie.</Typography>
                        ) : (
                            <Table size="small" sx={{ my: 1 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Porcentaje</TableCell>
                                        <TableCell>Monto</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {factura.ajustesPie.map((aj) => (
                                        <TableRow key={aj.id}>
                                            <TableCell>{aj.nombre}</TableCell>
                                            <TableCell>{aj.porcentaje}%</TableCell>
                                            <TableCell>${fmt(aj.monto)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </>
                )}

                {tab === 2 && (
                    <>
                        <Typography variant="h6">Pagos Realizados</Typography>

                        {pagos.length === 0 ? (
                            <Typography>No hay pagos registrados.</Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Forma</TableCell>
                                        <TableCell>Monto</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pagos.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.fecha?.slice(0, 10)}</TableCell>
                                            <TableCell>{p.metodo}</TableCell>
                                            <TableCell>${fmt(p.monto_aplicado)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </>
                )}





                <Divider sx={{ my: 2 }} />

                {/* TOTALES */}
                <Box sx={{ mt: 2 }}>
                    <Typography>
                        <strong>Total Factura:</strong> ${fmt(factura.totalFactura)}
                    </Typography>
                    <Typography>
                        <strong>Total Pagado:</strong> ${fmt(totalPagado)}
                    </Typography>
                    <Typography
                        sx={{
                            color: saldoPendiente <= 0 ? "green" : "red",
                            fontWeight: "bold",
                        }}
                    >
                        Saldo pendiente: ${fmt(saldoPendiente)}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
}