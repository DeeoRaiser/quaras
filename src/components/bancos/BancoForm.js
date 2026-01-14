"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export default function BancoForm({ open, onClose, onSubmit, form, setForm, isEdit }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Editar Banco" : "Nuevo Banco"}</DialogTitle>

      <DialogContent dividers>
        <TextField
          margin="dense"
          label="Nombre"
          fullWidth
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <TextField
          margin="dense"
          label="Sucursal"
          fullWidth
          value={form.sucursal}
          onChange={(e) => setForm({ ...form, sucursal: e.target.value })}
        />

        <TextField
          margin="dense"
          label="Número de Cuenta"
          fullWidth
          value={form.nro_cuenta}
          onChange={(e) => setForm({ ...form, nro_cuenta: e.target.value })}
        />

        <TextField
          margin="dense"
          label="CBU"
          fullWidth
          value={form.cbu}
          onChange={(e) => setForm({ ...form, cbu: e.target.value })}
        />

        <TextField
          margin="dense"
          label="Nota"
          fullWidth
          multiline
          rows={3}
          value={form.nota}
          onChange={(e) => setForm({ ...form, nota: e.target.value })}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit}>
          {isEdit ? "Guardar cambios" : "Crear banco"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
