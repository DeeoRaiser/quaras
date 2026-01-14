'use client';

import { ThemeProvider, CssBaseline, Container, Typography, Box } from "@mui/material";
import theme from "@/theme/theme";
import BancosDashboardLayout from "@/components/utils/Layout";

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 5 }}>

          <BancosDashboardLayout />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
