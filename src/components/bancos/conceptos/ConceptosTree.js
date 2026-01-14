"use client";

import React, { useEffect, useState } from "react";
import Tree from "rc-tree";
import "rc-tree/assets/index.css";
import {
    Typography,
    Box,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

import {
    InboxOutlined,
    Inbox,
    InsertDriveFile,
    ExpandMore,
    ChevronRight,
} from "@mui/icons-material";


function buildTree(data) {
    const map = {};
    const roots = [];

    data.forEach(item => {
        map[item.id] = { ...item, children: [] };
    });

    data.forEach(item => {
        if (item.parent_id) {
            if (map[item.parent_id]) {
                map[item.parent_id].children.push(map[item.id]);
            }
        } else {
            roots.push(map[item.id]);
        }
    });

    return roots;
}

export default function ConceptosTree() {
    const [conceptos, setConceptos] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentConcepto, setCurrentConcepto] = useState(null);
    const [nombre, setNombre] = useState("");

    const loadConceptos = async () => {
        const res = await fetch("/api/bancos/conceptos_bancarios");
        const data = await res.json();
        setConceptos(buildTree(data));
    };

    useEffect(() => {
        loadConceptos();
    }, []);

    const renderTreeNode = (node) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>{node.nombre}</Typography>
            <Tooltip title="Agregar sub-concepto">
                <IconButton
                    size="small"
                    onClick={() => handleOpenDialog({ parentId: node.id })}
                >
                    <Add fontSize="inherit" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
                <IconButton size="small" onClick={() => handleOpenDialog(node)}>
                    <Edit fontSize="inherit" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => handleDelete(node.id)}>
                    <Delete fontSize="inherit" />
                </IconButton>
            </Tooltip>
        </Box>
    );

    const handleOpenDialog = (concepto) => {
        setCurrentConcepto(concepto);
        setNombre(concepto?.nombre || "");
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentConcepto(null);
        setNombre("");
    };

    const handleSave = async () => {
        if (currentConcepto?.id) {
            await fetch(`/api/bancos/conceptos_bancarios/${currentConcepto.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre }),
            });
        } else {
            await fetch(`/api/bancos/conceptos_bancarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                    parent_id: currentConcepto?.parentId || null,
                }),
            });
        }
        handleCloseDialog();
        loadConceptos();
    };

    const handleDelete = async (id) => {
        if (confirm("¿Seguro que deseas eliminar este concepto?")) {
            await fetch(`/api/bancos/conceptos_bancarios/${id}`, { method: "DELETE" });
            loadConceptos();
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Administración de Conceptos Bancarios
            </Typography>

            <Tree
                treeData={conceptos}
                defaultExpandAll
                fieldNames={{ title: "nombre", key: "id", children: "children" }}
                titleRender={renderTreeNode}
                switcherIcon={({ expanded }) =>
                    expanded ? "": ""
                }
                icon={({ isLeaf }) =>
                    isLeaf ? "" : ""
                }
            />

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {currentConcepto?.id ? "Editar Concepto" : "Nuevo Concepto"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
