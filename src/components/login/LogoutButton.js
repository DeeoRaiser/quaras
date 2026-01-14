"use client";
import LogoutIcon from '@mui/icons-material/Logout';
import { signOut } from "next-auth/react";
import { Button } from "@mui/material";

export default function LogoutButton() {
  return (
    <Button
      variant="destructive"
      onClick={() => signOut({ callbackUrl: "/login" })}
      startIcon={<LogoutIcon />}
    >
      Cerrar sesión
    </Button>
  );
}
