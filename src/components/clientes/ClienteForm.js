"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";

export default function ClienteForm({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  isEdit,
}) {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="DNI"
              name="dni"
              value={form.dni}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="CUIT"
              name="cuit"
              value={form.cuit}
              onChange={handleChange}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="IVA"
              name="iva"
              value={form.iva}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Ingresos Brutos"
              name="iibb"
              value={form.iibb}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Número IIBB"
              name="numiibb"
              value={form.numiibb}
              onChange={handleChange}
            />
          </Stack>

          <TextField
            fullWidth
            label="Dirección"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notas"
            name="nota"
            value={form.nota}
            onChange={handleChange}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit}>
          {isEdit ? "Guardar Cambios" : "Crear Cliente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
