"use client";

import { useSearchParams } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function ErrorAccesoPage() {
  const searchParams = useSearchParams();
  const modulo = searchParams.get("modulo");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom color="error">
        🚫 Acceso Denegado
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        No tenés permisos para acceder al módulo:{" "}
        <strong>{modulo || "Desconocido"}</strong>
      </Typography>
      <Button
        component={Link}
        href="/"
        variant="contained"
        color="primary"
      >
        Volver al inicio
      </Button>
    </Box>
  );
}
