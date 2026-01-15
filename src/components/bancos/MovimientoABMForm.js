"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

import Loader from "@/components/common/Loader";

export default function MovimientoABMForm({ movimiento, onSubmit, onClose }) {
  const [bancos, setBancos] = useState([]);
  const [conceptos, setConceptos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    banco_id: "",
    fecha_movimiento: "",
    tipo: "INGRESO",
    importe: "",
    descripcion: "",
    concepto_id: "",
  });

  /* =============================
     CARGAR BANCOS + CONCEPTOS
  ============================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [bancosRes, conceptosRes] = await Promise.all([
          fetch("/api/bancos"),
          fetch("/api/bancos/conceptos_bancarios"),
        ]);

        const bancosData = await bancosRes.json();
        const conceptosData = await conceptosRes.json();

        setBancos(bancosData || []);
        setConceptos(conceptosData || []);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =============================
     MODO EDICIÓN
  ============================= */
  useEffect(() => {
    if (movimiento) {
      setFormData({
        banco_id: movimiento.banco_id || "",
        fecha_movimiento: movimiento.fecha_movimiento?.split("T")[0] || "",
        tipo: movimiento.tipo || "INGRESO",
        importe: movimiento.importe || "",
        descripcion: movimiento.descripcion || "",
        concepto_id: movimiento.concepto_id || "",
      });
    }
  }, [movimiento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* =============================
     GUARDAR
  ============================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const url = movimiento
        ? `/api/bancos/movimientos_bancarios/${movimiento.id}`
        : "/api/bancos/movimientos_bancarios";

      const res = await fetch(url, {
        method: movimiento ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          usuario_id: 1, // ⚠️ luego lo tomamos del session
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al guardar");
        return;
      }

      onSubmit?.(data);
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Error en la conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          {movimiento
            ? "Editar Movimiento Bancario"
            : "Nuevo Movimiento Bancario"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Banco */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Banco"
                name="banco_id"
                value={formData.banco_id}
                onChange={handleChange}
                required
                disabled={saving}
              >
                {bancos.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Fecha */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                fullWidth
                label="Fecha"
                name="fecha_movimiento"
                value={formData.fecha_movimiento}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                disabled={saving}
              />
            </Grid>

            {/* Tipo */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <MenuItem value="INGRESO">Ingreso</MenuItem>
                <MenuItem value="EGRESO">Egreso</MenuItem>
              </TextField>
            </Grid>

            {/* Importe */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                fullWidth
                label="Importe"
                name="importe"
                value={formData.importe}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </Grid>

            {/* Concepto */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Concepto"
                name="concepto_id"
                value={formData.concepto_id}
                onChange={handleChange}
                required
                disabled={saving}
              >
                {conceptos.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.concepto}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={saving}
              />
            </Grid>

            {/* Botones */}
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={saving}
              >
                {movimiento ? "Actualizar" : "Guardar"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* SPINNER GLOBAL */}
      <Loader open={loading || saving} />
    </>
  );
}
