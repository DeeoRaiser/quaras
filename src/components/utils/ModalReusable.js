"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ModalReusable({ open, onClose, title, children, actions }) {
    
    const handleClose = (event, reason) => {
        if (reason === "backdropClick") return; // ❌ NO cerrar al click afuera
        onClose?.();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {title}

                {/* Botón X para cerrar */}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {children}
            </DialogContent>

            {actions && <DialogActions>{actions}</DialogActions>}
        </Dialog>
    );
}
