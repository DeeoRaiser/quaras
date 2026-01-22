"use client";

import {
  TextField,
  Stack,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function ArticuloForm({
  form,
  setForm,
  isEdit,
  ivas = [],
  familias = [],
  categorias = [],
  clasificaciones = [],
  centroCostos = [],
  onSubmit,
}) {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const descuentosArray = form.descuentos
    ? (Array.isArray(form.descuentos)
      ? form.descuentos
      : String(form.descuentos).split(",").map(s => s.trim()).filter(Boolean))
    : [];

  const agregarDescuento = () => {
    const nuevo = prompt("Ingrese descuento o recargo con signo (+10 o -5):");
    if (!nuevo) return;

    if (!/^[+-]\d+(\.\d+)?$/.test(nuevo)) {
      alert("Formato inválido. Ejemplo: +10  -5  +3.5");
      return;
    }

    const lista = [...descuentosArray, nuevo].join(",");
    setForm({ ...form, descuentos: lista });
  };


  const eliminarDescuento = (index) => {
    const nuevaLista = descuentosArray.filter((_, i) => i !== index).join(",");
    setForm({ ...form, descuentos: nuevaLista });
  };

  return (
    <Stack spacing={2}>

      <TextField
        fullWidth
        label="Descripción"
        name="descripcion"
        value={form.descripcion || ""}
        onChange={handleChange}
      />

      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label="Precio"
          name="precio"
          type="number"
          value={form.precio || ""}
          onChange={handleChange}
        />

        <TextField
          select
          fullWidth
          label="IVA"
          name="iva_id"
          value={form.iva_id ?? ""}
          onChange={handleChange}
        >
          {(ivas || []).map((i) => (
            <MenuItem key={i.id} value={i.id}>
              {i.porcentaje}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* Descuentos */}
      <Stack spacing={1}>
        <Typography variant="subtitle1">Descuentos / Recargos</Typography>
        <Box>
          {descuentosArray.length === 0 && (
            <Typography color="text.secondary">No hay descuentos cargados.</Typography>
          )}

          {descuentosArray.map((item, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ p: 1, border: "1px solid #ddd", borderRadius: 2, mb: 1 }}
            >
              <Typography>{item}</Typography>
              <IconButton color="error" onClick={() => eliminarDescuento(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        <Button variant="outlined" startIcon={<AddIcon />} onClick={agregarDescuento}>
          Agregar descuento / recargo
        </Button>
      </Stack>

      <Divider />

      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label="Precio Neto"
          name="precio_neto"
          type="number"
          value={form.precio_neto || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Utilidad"
          name="utilidad"
          type="number"
          value={form.utilidad || ""}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Precio Venta"
          name="precio_venta"
          type="number"
          value={form.precio_venta || ""}
          onChange={handleChange}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField
          select
          fullWidth
          label="Familia"
          name="familia_id"
          value={form.familia_id ?? ""}
          onChange={handleChange}
        >
          {(familias || []).map((f) => (
            <MenuItem key={f.id} value={f.id}>
              {f.nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Categoría"
          name="categoria_id"
          value={form.categoria_id ?? ""}
          onChange={handleChange}
        >
          {(categorias || []).map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Clasificación"
          name="clasificacion_id"
          value={form.clasificacion_id ?? ""}
          onChange={handleChange}
        >
          {(clasificaciones || []).map((cl) => (
            <MenuItem key={cl.id} value={cl.id}>
              {cl.nombre}
            </MenuItem>
          ))}
        </TextField>


        <TextField
          select
          fullWidth
          label="Centro de Costo"
          name="centro_costo_id"
          value={form.centro_costo_id ?? ""}
          onChange={handleChange}
        >
          {(centroCostos || []).map((cc) => (
            <MenuItem key={cc.id} value={cc.id}>
              {cc.nombre}
            </MenuItem>
          ))}
        </TextField>

      </Stack>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Notas"
        name="nota"
        value={form.nota || ""}
        onChange={handleChange}
      />
    </Stack>
  );
}
