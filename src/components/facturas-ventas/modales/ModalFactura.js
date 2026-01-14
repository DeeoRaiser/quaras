"use client";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
    Divider, Table, TableHead, TableRow, TableCell, TableBody, Box
} from "@mui/material";

export default function ModalFactura({
    open,
    onClose,
    factura,
}) {
    if (!factura) return null;

    // Para no romper si faltan
    const detalle = factura.detalle || [];
    const pagos = factura.pagos || [];
    const clienteNombre = factura.cliente_nombre || factura.cliente?.cliente_nombre || '';
    const clienteDni = factura.cliente_dni || factura.cliente?.cliente_dni || '';

    const nroCompleto = `${String(factura.punto_vta).padStart(4, "0")}-${String(factura.numero).padStart(8, "0")}-${factura.letra}`;

    const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto_aplicado), 0);
    const saldoPendiente = Number(factura.totalFactura) - totalPagado;


    console.log(pagos)
    
    // Formateo numérico seguro
    const fmt = num => Number(num).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Factura {nroCompleto}</DialogTitle>
            <DialogContent dividers>
                {/* CLIENTE */}
                <Typography variant="h6">Datos del Cliente</Typography>
                <Typography>Nombre: {clienteNombre}</Typography>
                <Typography>DNI / CUIT: {clienteDni}</Typography>

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
                                <TableCell>${fmt(d.precio_venta)}</TableCell>
                                <TableCell>{d.ajuste ? `${d.ajuste}%` : "0%"}</TableCell>
                                <TableCell>{d.iva}%</TableCell>
                                <TableCell>${fmt(d.subtotal)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Divider sx={{ my: 2 }} />

                {/* IMPUESTOS */}
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

                <Divider sx={{ my: 2 }} />

                {/* AJUSTES PIE */}
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

                <Divider sx={{ my: 2 }} />

                {/* PAGOS */}
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