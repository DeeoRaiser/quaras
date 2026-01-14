"use client";
import { useState } from "react";
import {
  TextField,
  Grid,
  Tabs,
  Tab,
  Box,
  MenuItem,
  Stack,
} from "@mui/material";
import CrudFormDialog from "../common/CrudFormDialog";

export default function ProveedorForm({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  isEdit,
}) {
  const [tab, setTab] = useState(0);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // ENUMS DEFINITIVOS
  const ivaOptions = [
    "Exento",
    "Monotributista",
    "Resp,No Inscripto",
    "No Responsable",
    "Resp. Inscripto",
    "",
  ];

  const iibbOptions = [
    "Inscripto",
    "No Inscripto",
    "Exento",
    "Convenio",
    "Convenio media tasa",
    "Agente",
    "",
  ];

  return (
    <CrudFormDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
    >
      {/* Tabs Header */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Impositivo" />
        <Tab label="Contacto" />
        <Tab label="Nota" />
      </Tabs>

      {/* ================= TAB 1: IMPOSITIVO ================= */}
      {tab === 0 && (
        <Stack spacing={2} sx={{ width: "100%" }}>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Nombre"
              fullWidth
              value={form.nombre || ""}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />

            <TextField
              label="Razón Social"
              fullWidth
              value={form.razonsocial || ""}
              onChange={(e) => handleChange("razonsocial", e.target.value)}
            />

          </Stack>


          <TextField
            label="Dirección"
            fullWidth
            value={form.direccion || ""}
            onChange={(e) => handleChange("direccion", e.target.value)}
          />

          {/* IVA + cuit */}
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Condición IVA"
              fullWidth
              value={form.iva || ""}
              onChange={(e) => handleChange("iva", e.target.value)}
            >
              {ivaOptions.map((item) => (
                <MenuItem key={item} value={item}>
                  {item || "(vacío)"}
                </MenuItem>
              ))}
            </TextField>


            <TextField
              label="CUIT"
              fullWidth
              value={form.cuit || ""}
              onChange={(e) => handleChange("cuit", e.target.value)}
            />

          </Stack>

          {/* Número IIBB + IIBB */}
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Tipo IIBB"
              fullWidth
              value={form.iibb || ""}
              onChange={(e) => handleChange("iibb", e.target.value)}
            >
              {iibbOptions.map((item, i) => (
                <MenuItem key={i} value={item}>
                  {item || "(vacío)"}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Número IIBB"
              fullWidth
              value={form.numiibb || ""}
              onChange={(e) => handleChange("numiibb", e.target.value)}
            />


          </Stack>

        </Stack>
      )}

      {/* ================= TAB 2: CONTACTO ================= */}
      {tab === 1 && (
        <Stack spacing={2} sx={{ width: "100%" }}>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Teléfono"
              fullWidth
              value={form.telefono || ""}
              onChange={(e) => handleChange("telefono", e.target.value)}
            />

            <TextField
              label="Email"
              fullWidth
              value={form.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </Stack>

        </Stack>
      )}

      {/* ================= TAB 3: NOTA ================= */}
      {tab === 2 && (
        <Stack spacing={2} sx={{ width: "100%" }}>
          <TextField
            label="Nota"
            fullWidth
            multiline
            minRows={10}
            value={form.nota || ""}
            onChange={(e) => handleChange("nota", e.target.value)}
          />
        </Stack>
      )}
    </CrudFormDialog>
  );

}
