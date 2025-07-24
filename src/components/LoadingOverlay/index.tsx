import * as React from "react";
import { Box } from "@mui/material";
import CircularText from "../CircularText";

interface LoadingOverlayProps {
  loading: boolean;
}

export default function LoadingOverlay({ loading }: LoadingOverlayProps) {
  if (!loading) return null;

  return (
    <Box
      display={"flex"}
      justifyContent="center"
      alignItems={"center"}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
    >
      <CircularText
        text="LOADING*PLEASE*WAIT*"
        onHover="goBonkers"
        spinDuration={20}
        className="text-red-500"
        sx={{ color: "#383838" }}
      />
    </Box>
  );
}
