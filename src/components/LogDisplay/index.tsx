import * as React from "react";
import { Box, Typography } from "@mui/material";
import { Virtuoso } from "react-virtuoso";

interface LogDisplayProps {
  logList: string[];
}

export default function LogDisplay({ logList }: LogDisplayProps) {
  if (!logList.length) return null;

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      gap={1.5}
      justifyContent={"left"}
      alignItems={"left"}
      sx={{
        maxHeight: window.innerHeight * 0.35,
        overflowY: "auto",
        width: "100%",
        padding: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "4px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        "&::-webkit-scrollbar": { width: "8px" },
        "&::-webkit-scrollbar-track": {
          background: "rgba(0, 0, 0, 0.1)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <Virtuoso
        style={{ height: window.innerHeight * 0.35 }}
        totalCount={logList.length}
        itemContent={(index) => (
          <Typography
            variant="subtitle2"
            sx={{
              backgroundColor: "white",
              borderRadius: "4px",
              padding: "8px",
              width: "100%",
            }}
          >
            {logList[index]}
          </Typography>
        )}
      />
    </Box>
  );
}
