"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Grid,
  Typography,
  Paper,
  Box
} from "@mui/material";
import { useState, useEffect } from "react";
import PaymentIcon from "@mui/icons-material/Payment";

const metodos = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia Bancaria" },
  { value: "CHEQUE_PROPIO", label: "Cheque Propio" },
  { value: "CHEQUE_TERCERO", label: "Cheque de Tercero" },
  { value: "ECHEQ", label: "eCheq" },
];

export default function PagoModal({
  open,
  onClose,
  factura,
  onGuardado,
  onConfirmar,
  modo = "DB"
}) {


  const [form, setForm] = useState({
    fecha: "",
    monto: "",
    metodo: "",
    cuenta_bancaria_id: "",
    banco: "",
    lote: "",
    cupon: "",
    observacion: "",
    comprobante: ""
  });



  useEffect(() => {
    if (factura) {
      setForm({
        fecha: new Date().toISOString().slice(0, 10),
        monto: factura.saldoPendiente || "",
        metodo: "EFECTIVO",
        banco: "",
        lote: "",
        cupon: "",
        tarjeta: "",
        observacion: "",
        comprobante: ""
      });
    }
  }, [factura]);


  const [cuentas, setCuentas] = useState([]);

useEffect(() => {
  fetch("/api/cuentas-bancarias")
    .then(res => res.json())
    .then(setCuentas);
}, []);


  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMetodoChange = (value) => {
    setForm(prev => ({
      ...prev,
      metodo: value,
      banco: "",
      lote: "",
      cupon: "",
      tarjeta: "",
      comprobante: ""
    }));
  };

  const validar = () => {
    if (!form.monto || Number(form.monto) <= 0) {
      alert("Ingrese un monto válido");
      return false;
    }

if (form.metodo === "TRANSFERENCIA") {
  if (!form.cuenta_bancaria_id) {
    alert("Seleccione la cuenta bancaria de origen");
    return false;
  }

  if (!form.comprobante) {
    alert("Ingrese el comprobante de la transferencia");
    return false;
  }
}


    if (
      ["CHEQUE_PROPIO", "CHEQUE_TERCERO", "ECHEQ"].includes(form.metodo) &&
      !form.banco
    ) {
      alert("Ingrese el banco");
      return false;
    }

    return true;
  };

  const guardar = async () => {
    if (!validar()) return;

    const payload = {
      ...form,
      monto: Number(form.monto)
    };

    if (modo === "BORRADOR") {
      onConfirmar(payload);
      return;
    }

    const res = await fetch("/api/pagos/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        factura_id: factura.id,
        cliente_id: factura.cliente_id,
        ...payload
      })
    });

    if (!res.ok) {
      alert("Error al guardar el pago");
      return;
    }

    onGuardado?.();
    onClose();
  };

  const nroCompleto = factura
    ? `${String(factura.punto_vta).padStart(4, "0")}-${String(
      factura.numero
    ).padStart(8, "0")} ${factura.letra}`
    : "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PaymentIcon color="primary" />
        <Typography sx={{ ml: 1 }}>Registrar Pago</Typography>
      </DialogTitle>

      <DialogContent dividers>
        {factura && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography fontWeight="bold">
              Factura: {nroCompleto}
            </Typography>
            <Typography>
              Cliente: <strong>{factura.cliente_nombre}</strong>
            </Typography>
            <Typography>
              Saldo actual:{" "}
              <strong>
                $
                {Number(factura.saldoPendiente).toLocaleString("es-AR", {
                  minimumFractionDigits: 2
                })}
              </strong>
            </Typography>
          </Paper>
        )}

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Fecha"
              type="date"
              fullWidth
              value={form.fecha}
              onChange={(e) => handleChange("fecha", e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Monto"
              type="number"
              fullWidth
              required
              value={form.monto}
              onChange={(e) => handleChange("monto", e.target.value)}
              inputProps={{ min: 1, step: "0.01" }}
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Método de Pago"
              value={form.metodo}
              onChange={(e) => handleMetodoChange(e.target.value)}
              size="small"
            >
              {metodos.map(m => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

{form.metodo === "TRANSFERENCIA" && (
  <Grid item xs={12}>
    <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "#F0FAF6" }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            required
            label="Cuenta bancaria origen"
            value={form.cuenta_bancaria_id}
            onChange={(e) =>
              handleChange("cuenta_bancaria_id", e.target.value)
            }
            size="small"
          >
            {cuentas.map((c) => (
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
            value={form.comprobante}
            onChange={(e) =>
              handleChange("comprobante", e.target.value)
            }
            size="small"
          />
        </Grid>
      </Grid>
    </Paper>
  </Grid>
)}


          <Grid item xs={12}>
            <TextField
              label="Observación"
              fullWidth
              multiline
              minRows={2}
              value={form.observacion}
              onChange={(e) => handleChange("observacion", e.target.value)}
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={guardar}>
          Guardar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
}
