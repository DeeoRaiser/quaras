"use client";
import { useEffect, useState } from "react";
import CrudTable from "@/components/common/CrudTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Loader from "@/components/common/Loader";
import ProveedorForm from "@/components/proveedores/ProveedorForm";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/proveedores");
    const data = await res.json();
    setProveedores(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "telefono", headerName: "Teléfono", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "direccion", headerName: "Dirección", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            color="error"
            onClick={() => {
              setDeleteId(params.row.id);
              setOpenDelete(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const handleAdd = () => {
    setForm({ nombre: "", telefono: "", email: "", direccion: "" });
    setIsEdit(false);
    setOpenForm(true);
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditingId(row.id);
    setIsEdit(true);
    setOpenForm(true);
  };

  const handleSubmit = async () => {
    const url = isEdit
      ? `/api/proveedores/${editingId}`
      : "/api/proveedores";

    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      body: JSON.stringify(form),
    });

    setOpenForm(false);
    loadData();
  };

  const handleDelete = async () => {
    console.log("deleteId")
    console.log(deleteId)
    await fetch(`/api/proveedores/${deleteId}`, { method: "DELETE" });
    setOpenDelete(false);
    loadData();
  };

  return (
    <>
      <CrudTable
        title="Proveedores"
        rows={filtered}
        columns={columns}
        search={search}
        setSearch={setSearch}
        onAddClick={handleAdd}
      />

      <ProveedorForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        isEdit={isEdit}
      />

      <ConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar proveedor"
        message="¿Deseas eliminar este proveedor?"
      />

      <Loader open={loading} />
    </>
  );
}
