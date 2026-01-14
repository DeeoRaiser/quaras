"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";

export default function CrearUsuario() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!nombre || !apellido || !usuario || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Llamada a API
    const res = await fetch("/api/usuarios/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, usuario, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`Usuario "${usuario}" creado correctamente`);
      setNombre("");
      setApellido("");
      setUsuario("");
      setPassword("");
    } else {
      setError(data.error || "Ocurrió un error");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}
    >
      <Typography variant="h6" mb={2}>
        Crear Nuevo Usuario
      </Typography>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Nombre"
        fullWidth
        margin="normal"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <TextField
        label="Apellido"
        fullWidth
        margin="normal"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
      />
      <TextField
        label="Usuario"
        fullWidth
        margin="normal"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />
      <TextField
        label="Contraseña"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Crear Usuario
      </Button>
    </Box>
  );
}
