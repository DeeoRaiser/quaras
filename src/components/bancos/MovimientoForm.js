"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormHelperText,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function MovimientosPage() {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [banco, setBanco] = useState("");
  const [bancos, setBancos] = useState([]);
  const [errorFecha, setErrorFecha] = useState("");
  const [movimientos, setMovimientos] = useState([]);
  const [saldoAnterior, setSaldoAnterior] = useState(0);

  useEffect(() => {
    const fetchBancos = async () => {

      try {
        const res = await fetch("/api/bancos");
        const data = await res.json();
        setBancos(data);
      } catch (err) {
        console.error("Error al cargar bancos:", err);
      }
    };
    fetchBancos();
  }, []);

  const handleListar = async () => {
    if (!desde || !hasta) {
      setErrorFecha("Debes seleccionar ambas fechas.");
      return;
    }
    if (dayjs(hasta).isBefore(dayjs(desde))) {
      setErrorFecha("La fecha 'Hasta' debe ser mayor o igual que 'Desde'.");
      return;
    }
    if (!banco) {
      setErrorFecha("Debes seleccionar un banco.");
      return;
    }

    setErrorFecha("");

    try {
      const res = await fetch(
        `/api/bancos/movimientos_bancarios?banco_id=${banco}&desde=${dayjs(desde).format(
          "YYYY-MM-DD"
        )}&hasta=${dayjs(hasta).format("YYYY-MM-DD")}`
      );
      const data = await res.json();

      setSaldoAnterior(Number(data.saldoAnterior || 0));

      let saldo = data.saldoAnterior || 0;
      const movimientosConSaldo = data.movimientos.map((mov) => {
        saldo += mov.tipo === "INGRESO" ? Number(mov.importe) : -Number(mov.importe);
        return { ...mov, saldo };
      });

      setMovimientos(movimientosConSaldo);
    } catch (err) {
      console.error("Error al traer movimientos:", err);
      setMovimientos([]);
      setSaldoAnterior(0);
    }
  };

  let saldoAcumulado = Number(saldoAnterior) || 0;

  console.log(saldoAcumulado)

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Consulta de Movimientos Bancarios
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <DatePicker
                label="Desde"
                value={desde}
                format="DD/MM/YYYY"
                onChange={(newValue) => setDesde(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid>
              <DatePicker
                label="Hasta"
                value={hasta}
                format="DD/MM/YYYY"
                onChange={(newValue) => setHasta(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid>
              <TextField
                select
                label="Banco"
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                {bancos.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid>
              <Button variant="contained" color="primary" onClick={handleListar}>
                Listar
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>

        {saldoAnterior !== null && (
          <Typography sx={{ mt: 2 }} variant="subtitle1">
            Saldo al día anterior: ${Number(saldoAnterior).toFixed(2)}
          </Typography>
        )}

        {errorFecha && (
          <FormHelperText error sx={{ mt: 2 }}>
            {errorFecha}
          </FormHelperText>
        )}

        <Paper sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Importe</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Saldo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.length > 0 ? (
                movimientos.map((mov) => {
                  saldoAcumulado += mov.tipo === "EGRESO"
                    ? -Number(mov.monto)
                    : Number(mov.monto);
                  return (
                    <TableRow key={mov.id}>
                      <TableCell>{mov.fecha}</TableCell>

                      <TableCell
                        style={{
                          fontWeight: "bold",
                          color:
                            mov.tipo === "INGRESO"
                              ? "green"
                              : "red"
                        }}
                      >{mov.tipo}</TableCell>

                      <TableCell
                        style={{
                          fontWeight: "bold",
                          color:
                            mov.monto > 0
                              ? "green"
                              : "red"
                        }}
                      >${Number(mov.monto).toFixed(2)}</TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell>{mov.usuario}</TableCell>
                      <TableCell
                      
                      style={{
                          fontWeight: "bold",
                          color:
                            saldoAcumulado > 0
                              ? "green"
                              : "red"
                        }}
                      
                      >${saldoAcumulado.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay movimientos para mostrar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
}
