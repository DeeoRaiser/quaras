"use client";

import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";

import UserAvatar from "./UserAvatar";

const drawerWidth = 240;

// 🔹 Estructura del menú con niveles
const panels = [
  {
    title: "📦 Productos",
    route: "/articulos",
  },
  {
    title: "🏪 Proveedores",
     children: [
      { title: "🏪 Lista Proveedores", route: "/proveedores" },
      { title: "📒 Cuenta Corriente", route: "/proveedores/cuenta-corriente" },
    ],
  },
  {
    title: "🧑‍🤝‍🧑 Clientes",
     children: [
      { title: "🧑‍🤝‍🧑 Lista Clientes", route: "/clientes" },
      { title: "📒 Cuenta Corriente", route: "/clientes/cuenta-corriente" },
    ],
  },
  {
    title: "🏦 Bancos",
    children: [
      { title: "🏦 Lista Bancos", route: "/bancos" },
      { title: "📒 Libro Banco", route: "/bancos/libro-bancos" },
    ],
  },
  {
    title: "🧾 Factura Ventas",
    children: [
      { title: "➕ Nueva", route: "/facturas-venta/nueva" },
      { title: "🔍 Buscar", route: "/facturas-venta/buscar" },
    ],
  },

  {
    title: "📝 Factura Compras",
    children: [
      { title: "➕ Nueva", route: "/facturas-compra/nueva" },
      { title: "🔍 Buscar", route: "/facturas-compra/buscar" },
    ],
  },
];


export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const router = useRouter();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // 🔹 Manejar abrir/cerrar menús padres
  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar />
      <Divider />

      <List>
        {panels.map((panel) => (
          <React.Fragment key={panel.title}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (panel.children) {
                    toggleMenu(panel.title);
                  } else if (panel.route) {
                    router.push(panel.route);
                    setMobileOpen(false);
                  }
                }}
              >
                <ListItemText primary={panel.title} />
                {panel.children ? (
                  openMenus[panel.title] ? <ExpandLess /> : <ExpandMore />
                ) : null}
              </ListItemButton>
            </ListItem>

            {/* Submenú */}
            {panel.children && (
              <Collapse in={openMenus[panel.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {panel.children.map((child) => (
                    <ListItem key={child.title} disablePadding>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => {
                          router.push(child.route);
                          setMobileOpen(false);
                        }}
                      >
                        <ListItemText primary={child.title} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* TopBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Quaras
          </Typography>
          <UserAvatar />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Drawer móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Drawer desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
