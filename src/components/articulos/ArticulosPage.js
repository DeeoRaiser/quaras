"use client";

import { useState, useEffect } from "react";
import CrudTable from "@/components/common/CrudTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Loader from "@/components/common/Loader";
import ArticuloForm from "./ArticulosForm";
import ModalReusable from "@/components/utils/ModalReusable";

import { IconButton, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ArticuloPage() {
  const [productos, setProductos] = useState([]);
  const [ivas, setIvas] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [centrosCostos, setCentroCostos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    descripcion: "",
    precio: "",
    iva_id: "",
    descuentos: "",
    precio_neto: "",
    utilidad: "",
    precio_venta: "",
    maneja_stock: "",
    nota: "",
    familia_id: "",
    categoria_id: "",
    clasificacion_id: "",
    centro_costo_id: 0,
  };

  const [form, setForm] = useState(emptyForm);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ---------- HELPERS ----------
  const safeJson = async (res) => {
    if (!res.ok) return [];
    try {
      return await res.json();
    } catch {
      return [];
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [pRes, iRes, fRes, cRes, clRes, cCost] = await Promise.allSettled([
        fetch("/api/articulos"),
        fetch("/api/iva"),
        fetch("/api/familias"),
        fetch("/api/categorias"),
        fetch("/api/clasificaciones"),
        fetch("/api/centros-costos"),
      ]);

      const safe = async (p) =>
        p.status === "fulfilled" ? safeJson(p.value) : [];

      const [p, i, f, c, cl, cc] = await Promise.all([
        safe(pRes),
        safe(iRes),
        safe(fRes),
        safe(cRes),
        safe(clRes),
        safe(cCost),
      ]);

      setProductos(p);
      setIvas(i);
      setFamilias(f);
      setCategorias(c);
      setClasificaciones(cl);
      setCentroCostos(cc);

    } catch (err) {
      console.error("Error al cargar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ---------- FILTRO ----------
  const filtered = productos.filter((p) =>
    String(p.descripcion || "").toLowerCase().includes(search.toLowerCase())
  );

  // ---------- COLUMNAS ----------
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "descripcion", headerName: "Descripción", flex: 1 },
    { field: "precio", headerName: "Precio", width: 120 },
    { field: "precio_venta", headerName: "Precio Venta", width: 120 },
    { field: "descuentos", headerName: "Desc.", width: 150 },
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

  // ---------- CRUD ----------
  const handleAdd = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setEditingId(null);
    setOpenForm(true);
  };

  const handleEdit = (row) => {
    const normalRow = {
      ...row,
      descuentos: Array.isArray(row.descuentos)
        ? row.descuentos.join(",")
        : row.descuentos || "",
    };

    setForm(normalRow);
    setEditingId(row.id);
    setIsEdit(true);
    setOpenForm(true);
  };

  const handleSubmit = async () => {
    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/articulos/${editingId}` : "/api/articulos";

      const payload = {
        ...form,
        descuentos: typeof form.descuentos === "string"
          ? form.descuentos.split(",").map((s) => s.trim()).filter(Boolean)
          : Array.isArray(form.descuentos)
            ? form.descuentos
            : [],
      };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Error submit:", e);
    } finally {
      setOpenForm(false);
      loadAllData();
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/articulos/${deleteId}`, { method: "DELETE" });
    } catch (e) {
      console.error("Error delete:", e);
    } finally {
      setOpenDelete(false);
      loadAllData();
    }
  };

  // ---------- RENDER ----------
  return (
    <>
      <CrudTable
        title="📦 Productos"
        rows={filtered}
        columns={columns}
        search={search}
        setSearch={setSearch}
        onAddClick={handleAdd}
      />

      {/* MODAL REUSABLE */}
      <ModalReusable
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={isEdit ? "Editar Producto" : "Nuevo Producto"}
        actions={
          <>
            <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isEdit ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </>
        }
      >
        <ArticuloForm
          form={form}
          setForm={setForm}
          isEdit={isEdit}
          ivas={ivas}
          familias={familias}
          categorias={categorias}
          clasificaciones={clasificaciones}
          centroCostos={centrosCostos}
        />
      </ModalReusable>

      <ConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar Producto"
        message="¿Deseas eliminar este producto?"
      />

      <Loader open={loading} />
    </>
  );
}
