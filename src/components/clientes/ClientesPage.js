"use client";

import { useState, useEffect } from "react";
import CrudTable from "@/components/common/CrudTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Loader from "@/components/common/Loader";

import ClienteForm from "./ClienteForm";

import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    cuit: "",
    iva: "",
    direccion: "",
    telefono: "",
    email: "",
    nota: "",
    iibb: "",
    numiibb: "",
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // 🔹 Cargar LISTA DE CLIENTES
  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/clientes");
    const data = await res.json();
    setClientes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Filtrar por búsqueda (CrudTable usa esta lógica)
  const filtered = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔹 Columnas para CrudTable
  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "dni", headerName: "DNI / CUIT", flex: 1 },
    { field: "telefono", headerName: "Teléfono", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <IconButton
            color="primary"
            onClick={() => handleEdit(row)}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            color="error"
            onClick={() => {
              setDeleteId(row.id);
              setOpenDelete(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    }


  ];

  // 🔹 Crear nuevo
  const handleAdd = () => {
    setForm({
      nombre: "",
      apellido: "",
      dni: "",
      cuit: "",
      iva: "",
      direccion: "",
      telefono: "",
      email: "",
      nota: "",
      iibb: "",
      numiibb: "",
    });

    setIsEdit(false);
    setOpenForm(true);
  };

  // 🔹 Editar
 const handleEdit = (row) => {
  console.log("row")
  console.log(row)
  setForm({
    nombre: row.row.nombre,
    apellido: row.row.apellido,
    dni: row.row.dni,
    cuit: row.row.cuit,
    iva: row.row.iva,
    direccion: row.row.direccion,
    telefono: row.row.telefono,
    email: row.row.email,
    nota: row.row.nota,
    iibb: row.row.iibb,
    numiibb: row.row.numiibb,
  })

    setEditingId(row.id)
    setIsEdit(true)
    setOpenForm(true)
  };

  // 🔹 Guardar
  const handleSubmit = async () => {
    const url = isEdit
      ? `/api/clientes/${editingId}`
      : "/api/clientes";

    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setOpenForm(false);
    loadData();
  };

  // 🔹 Eliminar
  const handleDelete = async () => {
    await fetch(`/api/clientes/${deleteId}`, {
      method: "DELETE",
    });

    setOpenDelete(false);
    loadData();
  };

  return (
    <>
      {/* 📌 TABLA REUTILIZABLE */}
      <CrudTable
        title="Clientes"
        rows={filtered}
        columns={columns}
        search={search}
        setSearch={setSearch}
        onAddClick={handleAdd}
      />

      {/* 📌 MODAL DEL FORMULARIO */}
      <ClienteForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        isEdit={isEdit}
      />

      {/* 📌 CONFIRMAR ELIMINACIÓN */}
      <ConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message="¿Seguro deseas eliminar este cliente?"
      />

      {/* 📌 LOADING */}
      <Loader open={loading} />
    </>
  );
}
