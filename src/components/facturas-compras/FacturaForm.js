"use client";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import {
  Box, TextField, MenuItem, Button, Typography, Paper,
  Chip, IconButton, Tab, Tabs
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CircularProgress, Backdrop } from "@mui/material";

import PagoModal from "./modales/PagoModal";

export default function FacturaForm() {
  // ── ESTADOS ─
  const [proveedores, setProveedores] = useState([]);
  const [centroCosto, setCentroCosto] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [proveedor_id, setProveedorId] = useState("");
  const [centroCosto_id, setCentroCostoId] = useState("");
  const [puntoVenta, setPuntoVenta] = useState("");
  const [letra, setLetra] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [fecha, setFecha] = useState(dayjs());

  const [detalle, setDetalle] = useState([]);
  const [buscarArticulo, setBuscarArticulo] = useState("");

  const [impuestosDisponibles, setImpuestosDisponibles] = useState([]);
  const [impuestos, setImpuestos] = useState([]);
  const [impuestoSeleccionado, setImpuestoSeleccionado] = useState(null);

  const [ajustesPie, setAjustesPie] = useState([]);
  const [nuevoAjusteNombre, setNuevoAjusteNombre] = useState("");
  const [nuevoAjustePorcentaje, setNuevoAjustePorcentaje] = useState("");

  const [tab, setTab] = useState(0);

  const [pagos, setPagos] = useState([]);
  const [openPago, setOpenPago] = useState(false);

  // ── UTILS ─
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  // Calcular total de línea (precio * cantidad + ajuste porcentaje individual)
  const calcularTotalLinea = (item) => {
    const base = toNumber(item.precio_compra) * toNumber(item.cantidad);
    const ajustePct = toNumber(item.ajuste);
    const ajusteMonto = (base * ajustePct) / 100;
    const subtotalLinea = base + ajusteMonto
    item.subtotalLinea = subtotalLinea
    return subtotalLinea;
  };

  // ───── FETCHS INICIALES ─────
  useEffect(() => {
    let isMounted = true;

    const fetchData = async (url, setter) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error HTTP");
        const data = await res.json();
        if (isMounted) setter(data);
      } catch {
        if (isMounted) setter([]);
      }
    };

    fetchData("/api/proveedores", setProveedores);
    fetchData("/api/centros-costos", setCentroCosto);
    fetchData("/api/impuestos/factura-compras", setImpuestosDisponibles);
    return () => {
      isMounted = false;
    };
  }, []);



  useEffect(() => {
    if (!proveedor_id) {
      setProductos([]);
      return;
    }

    const fetchProductos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/articulos_compras/${proveedor_id}`);
        setProductos(await res.json());
      } catch {
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    console.log("PROVEEDORES")
    console.log(proveedores)

    fetchProductos();
  }, [proveedor_id]);


  // ───── DETALLE ─────
  const agregarArticulo = (prod) => {
    if (!prod) return;
    setDetalle(prev => [
      ...prev,
      {
        articulo_id: prod.id,
        descripcion: prod.descripcion,
        precio_compra: toNumber(prod.precio_compra),
        cantidad: 1,
        ajuste: 0,
        centroCosto: prod.centro_costo_id,
        iva: toNumber(prod.iva || prod.alicuota_iva || 21)
      }
    ]);
    setBuscarArticulo("");
  };

  const actualizarItem = (i, campo, valor) => {
    const normalized =
      (campo === "precio_compra" || campo === "cantidad" || campo === "ajuste") ? toNumber(valor) : valor;
    setDetalle(prev => prev.map((item, idx) => idx === i ? { ...item, [campo]: normalized } : item));
  };

  const eliminarItem = (i) => {
    setDetalle(prev => prev.filter((_, idx) => idx !== i));
  };

  // ───── IMPUESTOS ─────
  const agregarImpuesto = () => {
    if (!impuestoSeleccionado) return;
    if (impuestos.some((i) => i.id === impuestoSeleccionado.id)) {
      setImpuestoSeleccionado(null);
      return;
    }
    setImpuestos((prev) => [
      ...prev,
      {
        id: impuestoSeleccionado.id,
        codigo: impuestoSeleccionado.codigo ?? "",
        nombre: impuestoSeleccionado.nombre ?? "",
        porcentaje: toNumber(impuestoSeleccionado.alicuota ?? impuestoSeleccionado.porcentaje ?? 0),
      }
    ]);
    setImpuestoSeleccionado(null);
  };

  const eliminarImpuesto = (index) => {
    setImpuestos((prev) => prev.filter((_, i) => i !== index));
  };

  // ───── AJUSTES PIE ─────
  const agregarAjustePie = () => {
    if (!nuevoAjusteNombre || nuevoAjustePorcentaje === "") return;
    setAjustesPie((prev) => [
      ...prev,
      { nombre: nuevoAjusteNombre, porcentaje: toNumber(nuevoAjustePorcentaje) }
    ]);
    setNuevoAjusteNombre("");
    setNuevoAjustePorcentaje("");
  };

  const eliminarAjustePie = (index) => {
    setAjustesPie((prev) => prev.filter((_, i) => i !== index));
  };

  // ── CALCULOS ──

  // Subtotal sin ajuste manual, sin IVA (Precios con IVA incluido)
  const subtotalSinIVA = detalle.reduce(
    (acc, item) =>
      acc + (
        (toNumber(item.precio_compra) * toNumber(item.cantidad)) / (1 + (toNumber(item.iva || 0) / 100))
      ),
    0
  );

  // Subtotal con ajuste individual (no pie), sin IVA
  const subtotalIndividualAjusteSinIVA = detalle.reduce(
    (acc, item) =>
      acc + (
        (calcularTotalLinea(item)) / (1 + (toNumber(item.iva || 0) / 100))
      ),
    0
  );

  /** AJUSTES PIE **/
  const baseImponibleTotal = subtotalIndividualAjusteSinIVA; // Todas las bases imponibles de ítems, con ajuste individual
  const totalAjustesPie =
    ajustesPie.reduce(
      (acc, a) => acc + (baseImponibleTotal * toNumber(a.porcentaje)) / 100,
      0
    );

  // IVA agrupado por alícuota (ajuste pie distribuido)
  const ivaAgrupado = detalle.reduce((acc, item) => {
    const iva = toNumber(item.iva || 0);
    if (!acc[iva]) acc[iva] = { base: 0, monto: 0 };
    const precioConIva = calcularTotalLinea(item);
    const precioSinIva = precioConIva / (1 + iva / 100);

    // Proporción para distribuir el ajuste pie
    const proporcion = baseImponibleTotal > 0 ? precioSinIva / baseImponibleTotal : 0;
    const ajusteDistribuido = totalAjustesPie * proporcion;

    const nuevaBase = precioSinIva + ajusteDistribuido;
    const nuevoIVA = nuevaBase * (iva / 100);

    acc[iva].base += nuevaBase;
    acc[iva].monto += nuevoIVA;
    return acc;
  }, {});

  // Total IVA
  const totalIVA = Object.values(ivaAgrupado).reduce((acc, x) => acc + x.monto, 0);

  // Sumar todos los bases imponibles corregidas (con ajuste pie)
  const baseImponibleConAjustesPie = Object.values(ivaAgrupado).reduce((acc, x) => acc + x.base, 0);

  // Impuestos adicionales sobre base imponible total con ajuste (sin IVA)
  const totalImpuestos = impuestos.reduce(
    (acc, imp) => acc + (baseImponibleConAjustesPie * toNumber(imp.porcentaje)) / 100,
    0
  );

  // TOTAL FINAL (bases c/ajuste pie + IVA + impuestos adicionales)
  const totalFinal =
    baseImponibleConAjustesPie + totalIVA + totalImpuestos;

  // ── GUARDAR FACTURA ──
  const guardarFactura = async (pagoData) => {
    setLoading(true)

    const pagos = pagoData?.pagos || [];
    const totalPagado = pagoData?.totalPagado || 0;
    const saldo = totalFinal - totalPagado;

    // Armar array iva discriminado
    const ivaParaPayload = Object.entries(ivaAgrupado).map(([alicuotaStr, vals]) => ({
      alicuota: Number(alicuotaStr) || 0,
      base_imponible: Number(vals.base.toFixed(2)),
      monto: Number(vals.monto.toFixed(2))
    }));

    const impuestosParaPayload = impuestos.map((imp) => {
      const base = baseImponibleConAjustesPie;
      const monto = (base * toNumber(imp.porcentaje)) / 100;
      return {
        impuesto_id: imp.id,
        codigo: imp.codigo,
        nombre: imp.nombre,
        alicuota: toNumber(imp.porcentaje),
        base_imponible: Number(base.toFixed(2)),
        monto: Number(monto.toFixed(2)),
      };
    });


    const facturaPayload = {
      proveedor_id,
      puntoVenta: Number(puntoVenta),
      letra,
      numero: Number(numeroFactura),
      fecha: fecha ? fecha.format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss"),
      detalle,
      subtotalSinIVA: Number(subtotalSinIVA.toFixed(2)),
      subtotalIndividualAjusteSinIVA: Number(subtotalIndividualAjusteSinIVA.toFixed(2)),
      ajustesPie,
      totalAjustesPie: Number(totalAjustesPie.toFixed(2)),
      iva_discriminado: ivaParaPayload,
      impuestos: impuestosParaPayload,
      totalIVA: Number(totalIVA.toFixed(2)),
      totalImpuestos: Number(totalImpuestos.toFixed(2)),
      totalFinal: Number(totalFinal.toFixed(2)),
      saldo: Number(saldo.toFixed(2)),
      estado: saldo > 0 ? "PENDIENTE" : "PAGADA",
      pagos
    };

    try {
      const facturaRes = await fetch("/api/facturas-compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facturaPayload),
      });

      if (!facturaRes.ok) {
        const text = await facturaRes.text();
        throw new Error(text || "Error cargando la factura");
      }

      const factura = await facturaRes.json();

      alert("Factura creada con éxito");
      setOpenPago(false)

    } catch (err) {
      console.error("guardarFactura error:", err);
      alert("Error al cargar factura: " + (err.message || err));
    } finally {
      setLoading(false);
    }


  };
  const eliminarPago = (index) => {
    setPagos((prev) => prev.filter((_, i) => i !== index));
  };


  // ── RENDER ──
  const handleChange = (_e, newValue) => setTab(newValue);
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" mb={3}>Cargar Factura COMPRAS</Typography>

      {/* PROVEEDOR */}
      <Autocomplete
        sx={{ flex: 2, mb: 3 }}
        options={proveedores}
        getOptionLabel={(option) => option.nombre || ""}
        value={proveedores.find(c => c.id === proveedor_id) || null}
        onChange={(event, newValue) => setProveedorId(newValue ? newValue.id : "")}
        renderInput={(params) => (
          <TextField {...params} label="Proveedor" fullWidth />
        )}

      />

      {/* PV - LETRA - NUMERO - FECHA */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Punto de Venta"
          value={puntoVenta}
          fullWidth
          onChange={(e) => setPuntoVenta(Number(e.target.value))}
        >
        </TextField>

        <TextField
          label="Número"
          fullWidth
          value={numeroFactura}
          onChange={(e) => setNumeroFactura(Number(e.target.value))}
        />

        <TextField
          label="Letra"
          fullWidth
          value={letra}
          onChange={(e) => setLetra(e.target.value)}
        >
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Fecha"
            value={fecha}
            onChange={(newValue) => setFecha(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Box>

      {/* BUSCAR ARTICULO */}
      <Autocomplete
        options={productos}
        onChange={(e, value) => agregarArticulo(value)}
        onInputChange={(e, value) => setBuscarArticulo(value)}
        getOptionLabel={(option) =>
          option ? `${option.descripcion}` : ""
        }
        renderInput={(params) =>
          <TextField {...params} label="Buscar artículo del proveedor" fullWidth />
        }
        sx={{ mb: 3 }}
      />


      {/* DETALLE */}
      {detalle.map((item, i) => (
        <Box key={i} sx={{
          display: "flex", alignItems: "center",
          gap: 2, mb: 1, pb: 1,
          borderBottom: "1px solid #ddd"
        }}>
          <TextField
            type="number"
            label="Cant."
            sx={{ width: 80 }}
            value={item.cantidad}
            onChange={(e) =>
              actualizarItem(i, "cantidad", e.target.value)
            }
          />

          <Typography sx={{ width: 260 }}>
            {item.descripcion}
          </Typography>

          <TextField
            type="number"
            label="Precio"
            sx={{ width: 120 }}
            value={item.precio_compra}
            onChange={(e) => actualizarItem(i, "precio_compra", e.target.value)}
          />

          <TextField
            type="number"
            label="% Dto/Rgo"
            sx={{ width: 120 }}
            value={item.ajuste}
            onChange={(e) =>
              actualizarItem(i, "ajuste", e.target.value)
            }
          />

          {/* IVA del artículo */}
          <Typography sx={{ width: 80 }}>
            {item.iva ? `${item.iva}%` : "-"}
          </Typography>

          <Typography sx={{ width: 150 }}>
            ${calcularTotalLinea(item).toFixed(2)}
          </Typography>

          <IconButton color="error" onClick={() => eliminarItem(i)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Box sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={handleChange}>
          <Tab label="Descuentos / Recargos" />
          <Tab label="Impuestos" />
        </Tabs>

        {/* TAB 1: DESCUENTOS / RECARGOS */}
        {tab === 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Descuentos / Recargos</Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                label="Nombre"
                fullWidth
                value={nuevoAjusteNombre}
                onChange={(e) => setNuevoAjusteNombre(e.target.value)}
              />

              <TextField
                type="number"
                label="% (ej: -10 o 5)"
                sx={{ width: 130 }}
                value={nuevoAjustePorcentaje}
                onChange={(e) => setNuevoAjustePorcentaje(e.target.value)}
              />

              <Button variant="contained" onClick={agregarAjustePie}>
                <AddIcon />
              </Button>
            </Box>

            {/* CHIPS LISTA */}
            <Box sx={{ mt: 2 }}>
              {ajustesPie.map((aj, i) => (
                <Chip
                  key={i}
                  label={`${aj.nombre} (${aj.porcentaje}%)`}
                  onDelete={() => eliminarAjustePie(i)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* TAB 2: IMPUESTOS */}
        {tab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Impuestos adicionales</Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                select
                label="Seleccionar impuesto"
                fullWidth
                value={impuestoSeleccionado ? impuestoSeleccionado.id : ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const imp = impuestosDisponibles.find(
                    (i) => Number(i.id) === id
                  );
                  setImpuestoSeleccionado(imp || null);
                }}
              >
                {impuestosDisponibles.map((imp) => (
                  <MenuItem key={imp.id} value={imp.id}>
                    {imp.codigo} - {imp.nombre} ({imp.alicuota}%)
                  </MenuItem>
                ))}
              </TextField>

              <Button variant="contained" onClick={agregarImpuesto}>
                <AddIcon />
              </Button>
            </Box>

            {/* LISTA DE IMPUESTOS AGREGADOS */}
            <Box sx={{ mt: 2 }}>
              {impuestos.map((imp, i) => (
                <Chip
                  key={i}
                  label={`${imp.nombre} (${imp.porcentaje}%)`}
                  onDelete={() => eliminarImpuesto(i)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* IVA DISCRIMINADO POR ALICUOTA */}
      <Typography variant="h6" sx={{ mt: 3 }}>Detalle IVA por alícuota</Typography>
      <Box sx={{ mt: 1 }}>
        {Object.keys(ivaAgrupado).length === 0 && (
          <Typography color="text.secondary">No hay artículos con IVA.</Typography>
        )}
        {Object.entries(ivaAgrupado).map(([alicuota, vals]) => (
          <Box key={alicuota} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography>{alicuota}%</Typography>
            <Typography>
              Base: ${vals.base.toFixed(2)} — IVA: ${vals.monto.toFixed(2)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* TOTAL AJUSTES PIE  (solo si hay ajuste)*/}

      {totalAjustesPie !== 0 && (
        <Typography sx={{ textAlign: "right", mt: 2 }}>
          Dto/Rgo: ${totalAjustesPie.toFixed(2)}
        </Typography>
      )}



      <PagoModal
        open={openPago}
        onClose={() => setOpenPago(false)}
        onConfirmar={(pago) => {
          setPagos((prev) => [...prev, pago]);
          setOpenPago(false);
        }}
        modo="BORRADOR"   // ← clave
      />


      {/* TOTAL IMPUESTOS ADICIONALES (solo si hay impuestos) */}
      {totalImpuestos > 0 && (
        <Typography sx={{ textAlign: "right", mt: 2 }}>
          Total Impuestos adicionales: ${totalImpuestos.toFixed(2)}
        </Typography>
      )}


      {/* SUBTOTALES */}
      <Box sx={{ textAlign: "right", mt: 2 }}>
        <Typography>Total (sin IVA): ${baseImponibleConAjustesPie.toFixed(2)}</Typography>
      </Box>

      <Typography variant="h5" sx={{ textAlign: "right", mt: 1 }}>
        TOTAL FINAL: ${totalFinal.toFixed(2)}
      </Typography>


      {/* PAGOS */}
      {pagos.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography fontWeight="bold" mb={1}>
            Pagos cargados
          </Typography>

          {pagos.map((p, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #eee",
                py: 1
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>
                  {p.metodo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.fecha} {p.banco && `- ${p.banco}`} {p.tarjeta && `- ${p.tarjeta}`}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  ${Number(p.monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </Typography>

                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => eliminarPago(i)}
                >
                  Eliminar
                </Button>
              </Box>
            </Box>
          ))}
        </Paper>
      )}


      {/* BOTONES */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => setOpenPago(true)}
        >
          Cargar pago
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="warning"
          onClick={() =>
            guardarFactura({ pagos })
          }
        >
          Guardar
        </Button>
      </Box>
      <Backdrop
        open={loading}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Paper>
  );
}