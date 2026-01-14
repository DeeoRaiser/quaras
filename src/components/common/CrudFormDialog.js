"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

export default function CrudFormDialog({
  open,
  onClose,
  onSubmit,
  title,
  children,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"          // tamaño controlado
      fullWidth
      PaperProps={{
        sx: {
          height: "75vh",   // altura fija
          maxHeight: "75vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>

      {/* Contenedor scrollable */}
      <DialogContent
        dividers
        sx={{
          flexGrow: 1,
          overflowY: "auto",     // <==== hace que NO cambie de tamaño
          paddingBottom: 2,
        }}
      >
        {children}
      </DialogContent>

      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={onSubmit} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
