"use client"
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Typography, Paper, Box, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import PaymentIcon from "@mui/icons-material/Payment";


export default function PagoMultipleModal({
    open,
    onClose,
    facturas = [],      // ← facturas pendientes
    proveedor,          // o cliente
    onConfirmar
}) {
    const [pago, setPago] = useState({
        fecha: "",
        monto: "",
        metodo: "EFECTIVO",
        observacion: ""
    });

    const [aplicaciones, setAplicaciones] = useState([]);

    /* =============================
       INIT
    ============================= */
    useEffect(() => {
        if (open) {
            setPago({
                fecha: new Date().toISOString().slice(0, 10),
                monto: "",
                metodo: "EFECTIVO",
                observacion: ""
            });

            setAplicaciones(
                facturas.map(f => ({
                    factura_id: f.id,
                    numero: f.numero,
                    letra: f.letra,
                    punto_vta: f.punto_vta,
                    saldo: Number(f.saldoPendiente),
                    monto_aplicado: 0
                }))
            );
        }
    }, [open, facturas]);

    /* =============================
       HELPERS
    ============================= */
    const totalAplicado = aplicaciones.reduce(
        (acc, a) => acc + Number(a.monto_aplicado || 0),
        0
    );

    const restante = Number(pago.monto || 0) - totalAplicado;

    const updateAplicacion = (index, value) => {
        const monto = Number(value) || 0;

        setAplicaciones(prev =>
            prev.map((a, i) => {
                if (i !== index) return a;

                return {
                    ...a,
                    monto_aplicado: Math.min(monto, a.saldo)
                };
            })
        );
    };

    /* =============================
       VALIDACIONES
    ============================= */
    const validar = () => {
        if (!pago.monto || Number(pago.monto) <= 0) {
            alert("Ingrese un monto válido");
            return false;
        }

        if (totalAplicado === 0) {
            alert("Debe aplicar el pago al menos a una factura");
            return false;
        }

        if (totalAplicado > Number(pago.monto)) {
            alert("El monto aplicado supera el monto del pago");
            return false;
        }

        return true;
    };

    /* =============================
       CONFIRMAR
    ============================= */
    const confirmar = () => {
        if (!validar()) return;

        onConfirmar({
            pago: {
                ...pago,
                monto: Number(pago.monto)
            },
            aplicaciones: aplicaciones.filter(a => a.monto_aplicado > 0)
        });

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PaymentIcon color="primary" />
                Registrar Pago
            </DialogTitle>

            <DialogContent dividers>
                {/* INFO */}
                {proveedor && (
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography fontWeight="bold">
                            Proveedor: {proveedor.nombre}
                        </Typography>
                    </Paper>
                )}

                {/* DATOS PAGO */}
<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    mb: 3
  }}
>
  {/* Fecha */}
  <Box sx={{ flex: "1 1 30%" }}>
    <TextField
      label="Fecha"
      type="date"
      fullWidth
      value={pago.fecha}
      onChange={e =>
        setPago(prev => ({ ...prev, fecha: e.target.value }))
      }
      InputLabelProps={{ shrink: true }}
    />
  </Box>

  {/* Monto */}
  <Box sx={{ flex: "1 1 30%" }}>
    <TextField
      label="Monto total"
      type="number"
      fullWidth
      value={pago.monto}
      onChange={e =>
        setPago(prev => ({ ...prev, monto: e.target.value }))
      }
    />
  </Box>

  {/* Método */}
  <Box sx={{ flex: "1 1 30%" }}>
    <TextField
      label="Método"
      select
      fullWidth
      value={pago.metodo}
      onChange={e =>
        setPago(prev => ({ ...prev, metodo: e.target.value }))
      }
    >
      <MenuItem value="EFECTIVO">Efectivo</MenuItem>
      <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
      <MenuItem value="CHEQUE">Cheque</MenuItem>
    </TextField>
  </Box>

  {/* Observación */}
  <Box sx={{ flex: "1 1 100%" }}>
    <TextField
      label="Observación"
      fullWidth
      multiline
      minRows={2}
      value={pago.observacion}
      onChange={e =>
        setPago(prev => ({ ...prev, observacion: e.target.value }))
      }
    />
  </Box>
</Box>


                {/* FACTURAS */}
                <Typography fontWeight="bold" mb={1}>
                    Aplicar a facturas
                </Typography>

                {aplicaciones.map((a, i) => (
                    <Paper key={a.factura_id} sx={{ p: 2, mb: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography>
                                    Factura {a.punto_vta}-{a.numero} {a.letra}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Saldo: ${a.saldo.toFixed(2)}
                                </Typography>
                            </Box>

                            <TextField
                                label="Aplicar"
                                type="number"
                                sx={{ width: 150 }}
                                value={a.monto_aplicado}
                                onChange={e =>
                                    updateAplicacion(i, e.target.value)
                                }
                            />
                        </Box>
                    </Paper>
                ))}

                {/* RESUMEN */}
                <Box sx={{ textAlign: "right", mt: 2 }}>
                    <Typography>
                        Total aplicado: ${totalAplicado.toFixed(2)}
                    </Typography>
                    <Typography
                        color={restante < 0 ? "error" : "text.primary"}
                    >
                        Restante: ${restante.toFixed(2)}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" onClick={confirmar}>
                    Confirmar Pago
                </Button>
            </DialogActions>
        </Dialog>
    );
}
