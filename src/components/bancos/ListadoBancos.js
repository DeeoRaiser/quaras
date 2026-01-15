"use client";

import { useEffect, useState } from "react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Loader from "@/components/common/Loader";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, Typography, Box, Tooltip } from "@mui/material";

import BancoABMForm from "./BancoForm";
import ModalReusable from "../utils/ModalReusable";

export default function ListadoBancos() {
    const [bancos, setBancos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [bancoSeleccionado, setBancoSeleccionado] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
const [loading, setLoading] = useState(true);



    // Traer bancos
const fetchBancos = async () => {
  try {
    setLoading(true);
    const res = await fetch("/api/bancos");
    const data = await res.json();
    setBancos(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


    useEffect(() => {
        fetchBancos();
    }, []);

    const handleAgregar = () => {
        setBancoSeleccionado(null);
        setModalOpen(true);
    };

    const handleEditar = (banco) => {
        setBancoSeleccionado(banco);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Seguro que querés eliminar este banco?")) return;
        try {
            const res = await fetch(`/api/bancos/${id}`, { method: "DELETE" });
            const data = await res.json();
            setMensaje(data.message || data.error);
            fetchBancos();
        } catch (err) {
            console.error(err);
            setMensaje("Error al eliminar banco");
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 10, p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center">
                    <AccountBalanceIcon sx={{ mr: 1 }} /> Bancos
                </Typography>

                <Tooltip title="Agregar nuevo banco" arrow>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAgregar}
                    >
                        Nuevo
                    </Button>
                </Tooltip>
            </Box>

            {/* Modal */}
            <ModalReusable
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false); // cierra modal
                    fetchBancos();       // recarga listado
                }}
                title={bancoSeleccionado ? "Editar Banco" : "Agregar Banco"}
            >
                <BancoABMForm
                    banco={bancoSeleccionado}
                    modoEdit={!!bancoSeleccionado}
                    onClose={() => setModalOpen(false)}
                    onSuccess={fetchBancos} // opcional: recarga al guardar
                />
            </ModalReusable>

            {/* Tabla */}
            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "primary.main" }}>
                            {["Nombre", "Sucursal", "Nro. Cuenta", "CBU", "Nota", "Acciones"].map(
                                (title) => (
                                    <TableCell
                                        key={title}
                                        sx={{ color: "#fff", fontWeight: "bold" }}
                                        align={title === "Acciones" ? "center" : "left"}
                                    >
                                        {title}
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {bancos.map((banco) => (
                            <TableRow key={banco.id}>
                                <TableCell>{banco.nombre}</TableCell>
                                <TableCell>{banco.sucursal}</TableCell>
                                <TableCell>{banco.nro_cuenta}</TableCell>
                                <TableCell>{banco.cbu}</TableCell>
                                <TableCell>{banco.nota}</TableCell>
                                <TableCell align="center" sx={{ display: "flex", justifyContent: "center" }}>
                                    <Tooltip title="Editar" arrow>
                                        <IconButton color="primary" onClick={() => handleEditar(banco)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Borrar" arrow>
                                        <IconButton color="error" onClick={() => handleDelete(banco.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {mensaje && (
                <Typography mt={2} align="center" color="success.main">
                    {mensaje}
                </Typography>
            )}
            <Loader open={loading} />

        </Box>
        
    );
}
