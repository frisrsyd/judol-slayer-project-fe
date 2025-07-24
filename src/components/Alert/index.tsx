import * as React from "react";
import {
  Alert,
  LinearProgress,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { AlertProps } from "../../hooks/useAlert";

interface AlertComponentProps {
  alert: AlertProps;
  onClose?: () => void;
}

export default function AlertComponent({
  alert,
  onClose,
}: AlertComponentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Slide
      direction={isMobile ? "down" : "left"}
      in={alert.isopen}
      timeout={{ enter: 500, exit: 300 }}
      mountOnEnter
      unmountOnExit
    >
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
        action={
          onClose ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
              sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : null
        }
      >
        {alert.message || "Judol Slayer is ready to slay!"}
        {alert.progress !== undefined && (
          <LinearProgress
            variant="determinate"
            color="inherit"
            value={alert.progress}
            sx={{
              mt: 1,
              transition: "width 0.2s ease-out",
              "& .MuiLinearProgress-bar": {
                transition: "transform 0.2s ease-out",
              },
            }}
          />
        )}
      </Alert>
    </Slide>
  );
}
