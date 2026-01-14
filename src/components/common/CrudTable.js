"use client";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, TextField, Stack } from "@mui/material";

export default function CrudTable({
  rows,
  columns,
  title = "",
  onAddClick,
  search,
  setSearch,
}) {
  return (
    <Box sx={{ height: 520, width: "100%" }}>
      <h2>{title}</h2>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <TextField
          label="Buscar..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 250 }}
        />

        <Button variant="contained" onClick={onAddClick}>
          Nuevo +
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } }
        }}
      />
    </Box>
  );
}
