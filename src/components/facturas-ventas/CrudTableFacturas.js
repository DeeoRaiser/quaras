"use client";

import { 
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Tooltip,
  Box
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentsIcon from "@mui/icons-material/Payments";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CrudTableFacturas({
  data,
  onAgregarPago,
  verDetalle,
  onEditarFactura,
  onEliminar
}) {

  // 🔥 Garantiza que SIEMPRE sea un array
  const lista = Array.isArray(data) ? data : [];

  return (

    <Paper sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Número</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Monto</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Saldo Pendiente</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          
          {lista.map((f) => {
            const saldoColor = f.saldoPendiente > 0 ? "red" : "green";

            const fechaFormateada = f.fecha
              ? new Date(f.fecha).toLocaleDateString("es-AR")
              : "";

            return (
              <TableRow key={f.id}>
                <TableCell>
                  {String(f.punto_vta).padStart(4, "0")}-{String(f.numero).padStart(8, "0")}-{f.letra}
                </TableCell>

                <TableCell>{f.cliente_nombre}</TableCell>

                <TableCell>
                  <strong>${f.totalFactura}</strong>
                </TableCell>

                <TableCell
                  style={{
                    fontWeight: "bold",
                    color:
                      f.estado === "PAGADA"
                        ? "green"
                        : f.estado === "PARCIAL"
                        ? "orange"
                        : "red"
                  }}
                >
                  {f.estado}
                </TableCell>

                <TableCell style={{ color: saldoColor, fontWeight: "bold" }}>
                  ${f.saldoPendiente}
                </TableCell>

                <TableCell>{fechaFormateada}</TableCell>

                <TableCell align="center">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="Ver detalle">
                      <IconButton color="primary" onClick={() => verDetalle?.(f)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    {f.estado !== "PAGADA" && (
                      <Tooltip title="Agregar pago">
                        <IconButton color="success" onClick={() => onAgregarPago?.(f)}>
                          <PaymentsIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Modificar datos">
                      <IconButton color="warning" onClick={() => onEditarFactura?.(f)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    {onEliminar && (
                      <Tooltip title="Eliminar factura">
                        <IconButton color="error" onClick={() => onEliminar(f.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
    
  );
}
