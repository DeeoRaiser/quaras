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

export default function MovimientoABMForm({ movimiento, onSubmit, onClose }) {
    const [bancos, setBancos] = useState([]);
    const [conceptos, setConceptos] = useState([]);
    const [formData, setFormData] = useState({
        banco_id: "",
        fecha_movimiento: "",
        tipo: "INGRESO",
        importe: "",
        descripcion: "",
        concepto_id: "",
    });

    // Cargar bancos y conceptos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const bancosRes = await fetch("/api/bancos");
                const bancosData = await bancosRes.json();
                setBancos(bancosData);

                const conceptosRes = await fetch("/api/bancos/conceptos_bancarios");
                const conceptosData = await conceptosRes.json();
                setConceptos(conceptosData);
            } catch (err) {
                console.error("Error cargando datos:", err);
            }
        };
        fetchData();
    }, []);

    // Si recibimos movimiento en edición, setear formData
    useEffect(() => {
        if (movimiento) {
            setFormData({
                banco_id: movimiento.banco_id || "",
                fecha_movimiento: movimiento.fecha_movimiento?.split("T")[0] || "",
                tipo: movimiento.tipo || "INGRESO",
                importe: movimiento.importe || "",
                descripcion: movimiento.descripcion || "",
                concepto_id: movimiento.concepto_id || ""
            });
        }
    }, [movimiento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        formData.usuario_id = 1
        console.log(formData)
        try {
            const url = movimiento
                ? `/api/bancos/movimientos_bancarios/${movimiento.id}` // 👈 PUT si estamos editando
                : "/api/bancos/movimientos_bancarios"; // 👈 POST si es nuevo

            const res = await fetch(url, {
                method: movimiento ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                onSubmit?.(data);
                onClose?.();
            } else {
                alert(data.error || "Error al guardar");
            }
        } catch (err) {
            console.error(err);
            alert("Error en la conexión");
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
                {movimiento ? "Editar Movimiento Bancario" : "Nuevo Movimiento Bancario"}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {/* Banco */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            fullWidth
                            label="Banco"
                            name="banco_id"
                            value={formData.banco_id}
                            onChange={handleChange}
                            required
                        >
                            {bancos.map((b) => (
                                <MenuItem key={b.id} value={b.id}>
                                    {b.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Fecha */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            type="date"
                            fullWidth
                            label="Fecha"
                            name="fecha_movimiento"
                            value={formData.fecha_movimiento}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    {/* Tipo */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            select
                            fullWidth
                            label="Tipo"
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="INGRESO">Ingreso</MenuItem>
                            <MenuItem value="EGRESO">Egreso</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Importe */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            type="number"
                            fullWidth
                            label="Importe"
                            name="importe"
                            value={formData.importe}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    {/* Concepto */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            select
                            fullWidth
                            label="Concepto"
                            name="concepto_id"
                            value={formData.concepto_id}
                            onChange={handleChange}
                            required
                        >
                            {conceptos.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.concepto}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Descripción */}
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Descripción"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                        />
                    </Grid>

                    {/* Botones */}
                    <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                        <Button variant="outlined" color="error" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button variant="contained" color="primary" type="submit">
                            {movimiento ? "Actualizar" : "Guardar"}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
}
