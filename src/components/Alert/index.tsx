import * as React from "react";
import { Alert, LinearProgress } from "@mui/material";
import { AlertProps } from "../../hooks/useAlert";

interface AlertComponentProps {
  alert: AlertProps;
}

export default function AlertComponent({ alert }: AlertComponentProps) {
  if (!alert.isopen) return null;

  return (
    <Alert
      sx={{
        position: "fixed",
        top: 8,
        zIndex: 10000,
        maxWidth: { xs: "100%", sm: "60%", md: "40%", lg: "30%" },
        right: 8,
        mr: { xs: 0, sm: 1.5 },
        left: { xs: 8, sm: "auto", md: "auto", lg: "auto" },
      }}
      variant="filled"
      severity={alert.type || "info"}
    >
      {alert.message || "Judol Slayer is ready to slay!"}
      <LinearProgress
        variant="determinate"
        color="inherit"
        value={alert.progress}
        sx={{ mt: 1 }}
      />
    </Alert>
  );
}
