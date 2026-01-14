"use client";

import React, { useState } from "react";
import { Avatar, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import LogoutButton from "./LogoutButton";
export default function UserAvatar({ userName = "Usuario" }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={userName}>
        <IconButton onClick={handleClick} sx={{ p: 0 }}>
          <Avatar>{userName.charAt(0).toUpperCase()}</Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>Perfil</MenuItem>
        <MenuItem>Configuración</MenuItem>
        <MenuItem><LogoutButton/></MenuItem>
      </Menu>
    </>
  );
}
