import * as React from "react";
import { Box, Typography } from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import { LogEntry } from "../../hooks/useCommentManagement";

interface LogDisplayProps {
  logList: LogEntry[];
}

export default function LogDisplay({ logList }: LogDisplayProps) {
  if (!logList.length) return null;

  // Sort logs by time in descending order (newest first)
  const sortedLogs = React.useMemo(() => {
    return [...logList].sort((a, b) => {
      const timeA = a.time || 0;
      const timeB = b.time || 0;
      return timeB - timeA; // Descending order
    });
  }, [logList]);

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
        style={{ height: window.innerHeight * 0.4 }}
        totalCount={sortedLogs.length}
        itemContent={(index) => {
          const logEntry = sortedLogs[index];
          // Extract the log text from the log entry object
          const logText =
            typeof logEntry === "string"
              ? logEntry
              : logEntry?.log || JSON.stringify(logEntry);

          return (
            <Typography
              variant="subtitle2"
              sx={{
                backgroundColor: "white",
                borderRadius: "4px",
                padding: "8px",
                width: "100%",
                borderTop: index === 0 ? "none" : "1px solid #e0e0e0",
                borderBottom: index === sortedLogs.length - 1 ? "none" : "1px solid #e0e0e0",
                wordBreak: "break-word",
              }}
            >
              {logText}
            </Typography>
          );
        }}
      />
    </Box>
  );
}
