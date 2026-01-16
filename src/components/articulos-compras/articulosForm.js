"use client";

import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  MenuItem,
  IconButton,
  Chip
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AltaArticuloProveedor() {
  const [loading, setLoading] = useState(false);

  const [proveedores, setProveedores] = useState([]);
  const [proveedoresAsociados, setProveedoresAsociados] = useState([]);

  const [form, setForm] = useState({
    codigo: "",
    descripcion: "",
    iva: 21,
    centro_costo_id: "",
  });

  useEffect(() => {
    setLoading(true);
    fetch("/api/proveedores")
      .then(r => r.json())
      .then(setProveedores)
      .finally(() => setLoading(false));
  }, []);

  const agregarProveedor = (prov) => {
    if (!prov) return;
    if (proveedoresAsociados.some(p => p.id === prov.id)) return;
    setProveedoresAsociados(prev => [...prev, prov]);
  };

  const eliminarProveedor = (id) => {
    setProveedoresAsociados(prev => prev.filter(p => p.id !== id));
  };

  const guardar = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        proveedores: proveedoresAsociados.map(p => p.id)
      };

      const res = await fetch("/api/articulos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Error al guardar");

      alert("Artículo guardado correctamente");
      setForm({ codigo: "", descripcion: "", iva: 21, centro_costo_id: "" });
      setProveedoresAsociados([]);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h5" mb={2}>Carga de Artículos</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Código"
          fullWidth
          value={form.codigo}
          onChange={(e) => setForm({ ...form, codigo: e.target.value })}
        />
        <TextField
          label="IVA %"
          type="number"
          sx={{ width: 120 }}
          value={form.iva}
          onChange={(e) => setForm({ ...form, iva: e.target.value })}
        />
      </Box>

      <TextField
        label="Descripción"
        fullWidth
        sx={{ mb: 2 }}
        value={form.descripcion}
        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
      />

      <TextField
        label="Centro de Costo"
        fullWidth
        sx={{ mb: 3 }}
        value={form.centro_costo_id}
        onChange={(e) => setForm({ ...form, centro_costo_id: e.target.value })}
      />

      <Typography fontWeight="bold">Proveedores asociados</Typography>

      <Autocomplete
        options={proveedores}
        getOptionLabel={(o) => o.nombre || ""}
        onChange={(_, v) => agregarProveedor(v)}
        renderInput={(params) => (
          <TextField {...params} label="Agregar proveedor" />
        )}
        sx={{ my: 2 }}
      />

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {proveedoresAsociados.map(p => (
          <Chip
            key={p.id}
            label={p.nombre}
            onDelete={() => eliminarProveedor(p.id)}
            deleteIcon={<DeleteIcon />}
          />
        ))}
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={guardar}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Guardar Artículo
        </Button>
      </Box>
    </Paper>
  );
}
