"use client";
import dayjs from "dayjs";

import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Typography, Paper, MenuItem, Box
} from "@mui/material";
import { useEffect, useState } from "react";
import PaymentIcon from "@mui/icons-material/Payment";

export default function AplicarPagoModal({
    open,
    onClose,
    facturas = [],
    tipo,
    entidadId,
    onConfirmar
}) {
    const [pago, setPago] = useState({
        fecha: "",
        monto: "",
        metodo: "EFECTIVO",
        cuenta_bancaria_id: "",
        comprobante: "",
        observacion: ""
    });

    const [aplicaciones, setAplicaciones] = useState([]);


    const [cuentas, setCuentas] = useState([]);



    useEffect(() => {
        fetch("/api/cuentas-bancarias")
            .then(res => res.json())
            .then(setCuentas);
    }, []);

    /* =============================
       INIT
    ============================= */
    useEffect(() => {
        if (open) {
            setPago({
                fecha: dayjs().format("YYYY-MM-DD"),
                monto: "",
                metodo: "EFECTIVO",
                cuenta_bancaria_id: "",
                comprobante: "",
                observacion: ""
            });

            console.log(pago)

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

        if (pago.metodo !== "EFECTIVO") {
            if (!pago.cuenta_bancaria_id) {
                alert("Seleccione la cuenta bancaria");
                return false;
            }

            if (!pago.comprobante) {
                alert("Ingrese el comprobante");
                return false;
            }
        }

        return true;
    };





    const confirmar = async () => {
        console.log(facturas)
        if (!validar()) return;

        const body = {
            cliente_id: entidadId,
            metodo: pago.metodo,
            monto: Number(pago.monto),
            fecha: pago.fecha,
            observacion: pago.observacion,
            cuenta_bancaria_id:
                pago.metodo !== "EFECTIVO" ? pago.cuenta_bancaria_id : null,
            comprobante: pago.comprobante,
            tipo_movimiento: pago.metodo !== "EFECTIVO" ? "CREDITO" : null,
            aplicaciones: aplicaciones
                .filter(a => a.monto_aplicado > 0)
                .map(a => ({
                    factura_id: a.factura_id,
                    monto: a.monto_aplicado,
                    punto_vta: a.punto_vta,
                    numero: a.numero,
                    letra: a.letra
                }))
        };

        

        const res = await fetch("/api/pagos/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)

            
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.error || "Error al registrar pago");
            return;
        }

        onConfirmar?.();
        onClose();
    };



    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PaymentIcon color="primary" />
                Registrar Pago
            </DialogTitle>

            <DialogContent dividers>


                {/* DATOS PAGO */}
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={3}>
                        <TextField
                            label="Fecha"
                            type="date"
                            fullWidth
                            value={pago.fecha}
                            onChange={e =>
                                setPago(prev => ({ ...prev, fecha: e.target.value }))
                            }
                            slotProps={{
                                inputLabel: { shrink: true }
                            }}
                        />
                    </Grid>

                    <Grid item xs={3}>
                        <TextField
                            type="date"
                            fullWidth
                            value={pago.fecha}
                            onChange={e =>
                                setPago(prev => ({ ...prev, fecha: e.target.value }))
                            }
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            label="Método"
                            value={pago.metodo}
                            onChange={e =>
                                setPago(prev => ({
                                    ...prev,
                                    metodo: e.target.value,
                                    cuenta_bancaria_id: "",
                                    comprobante: ""
                                }))
                            }
                        >
                            <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                            <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                            <MenuItem value="CHEQUE">Cheque</MenuItem>
                            <MenuItem value="ECHEQ">eCheq</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
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
                    </Grid>
                </Grid>


                {pago.metodo !== "EFECTIVO" && (
                    <Paper sx={{ p: 2, mb: 3, bgcolor: "#F0FAF6" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label="Cuenta bancaria"
                                    value={pago.cuenta_bancaria_id}
                                    onChange={e =>
                                        setPago(prev => ({
                                            ...prev,
                                            cuenta_bancaria_id: e.target.value
                                        }))
                                    }
                                >
                                    {cuentas.map(c => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.banco_nombre} · {c.numero_cuenta} ({c.tipo})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Comprobante"
                                    fullWidth
                                    value={pago.comprobante}
                                    onChange={e =>
                                        setPago(prev => ({
                                            ...prev,
                                            comprobante: e.target.value
                                        }))
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                )}





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
