"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme/theme";
import Sidebar from "@/components/utils/Layout";

export default function AppLayout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Sidebar>
        {children}
      </Sidebar>
    </ThemeProvider>
  );
}