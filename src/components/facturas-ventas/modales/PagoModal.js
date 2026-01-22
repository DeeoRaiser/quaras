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

import dayjs from "dayjs";

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
    fecha:  dayjs().format("YYYY-MM-DD"),
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
    if (!open || !factura) return;
    setForm({
      fecha: dayjs().format("YYYY-MM-DD"),
      monto: factura.saldoPendiente || "",
      metodo: "EFECTIVO",
      cuenta_bancaria_id: "",
      banco: "",
      lote: "",
      cupon: "",
      observacion: "",
      comprobante: ""
    });

  }, []);



  const [cuentas, setCuentas] = useState([]);

  useEffect(() => {
      console.log("useEffect ejecutado");
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
    cliente_id: factura.cliente_id,
    metodo: form.metodo,
    monto: Number(form.monto),
    fecha: form.fecha,
    observacion: form.observacion || "",
    cuenta_bancaria_id:
      form.metodo === "TRANSFERENCIA"
        ? Number(form.cuenta_bancaria_id)
        : null,
    comprobante: form.comprobante || null,
    tipo_movimiento: "INGRESO",
    aplicaciones: [
      {
        factura_id: factura.id,
        monto: Number(form.monto),
        punto_vta: factura.punto_vta,
        numero: factura.numero,
        letra: factura.letra
      }
    ]
  };

  if (modo === "BORRADOR") {
    onConfirmar(payload);
    return;
  }

  const res = await fetch("/api/clientes/pagos/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
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

        <Box display="flex" flexDirection="column" gap={2}>

          {/* Fecha + Monto */}
          <Box display="flex" gap={2}>
            <Box flex={1}>
              <TextField
                label="Fecha"
                type="date"
                fullWidth
                value={form.fecha}
                onChange={(e) => handleChange("fecha", e.target.value)}
                size="small"
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            </Box>

            <Box flex={1}>
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
            </Box>
          </Box>

          {/* Método de pago */}
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

          {/* Transferencia */}
          {form.metodo === "TRANSFERENCIA" && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "#F0FAF6" }}>
              <Box display="flex" flexDirection="column" gap={2}>
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

                <TextField
                  label="Comprobante"
                  fullWidth
                  value={form.comprobante}
                  onChange={(e) =>
                    handleChange("comprobante", e.target.value)
                  }
                  size="small"
                />
              </Box>
            </Paper>
          )}

          {/* Observación */}
          <TextField
            label="Observación"
            fullWidth
            multiline
            minRows={2}
            value={form.observacion}
            onChange={(e) => handleChange("observacion", e.target.value)}
            size="small"
          />

        </Box>

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
