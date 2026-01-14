"use client";

import { useEffect, useState } from "react";
import CrudTable from "@/components/common/CrudTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Loader from "@/components/common/Loader";
import BancoForm from "@/components/bancos/BancoForm";

import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function BancosPage() {
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    sucursal: "",
    nro_cuenta: "",
    cbu: "",
    nota: "",
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/bancos");
    const data = await res.json();
    setBancos(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = bancos.filter((b) =>
    b.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "sucursal", headerName: "Sucursal", flex: 1 },
    { field: "nro_cuenta", headerName: "Cuenta", flex: 1 },
    { field: "cbu", headerName: "CBU", flex: 1 },
    { field: "nota", headerName: "Nota", flex: 1 },

    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row)}>
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
    setForm({
      nombre: "",
      sucursal: "",
      nro_cuenta: "",
      cbu: "",
      nota: "",
    });
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
    const url = isEdit ? `/api/bancos/${editingId}` : "/api/bancos";
    const method = isEdit ? "PUT" : "POST";

    await fetch(url, {
      method,
      body: JSON.stringify(form),
    });

    setOpenForm(false);
    loadData();
  };

  const handleDelete = async () => {
    await fetch(`/api/bancos/${deleteId}`, {
      method: "DELETE",
    });

    setOpenDelete(false);
    loadData();
  };

  return (
    <>
      <CrudTable
        title="Bancos"
        rows={filtered}
        columns={columns}
        search={search}
        setSearch={setSearch}
        onAddClick={handleAdd}
      />

      <BancoForm
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
        title="Eliminar banco"
        message="¿Deseas eliminar este banco?"
      />

      <Loader open={loading} />
    </>
  );
}
