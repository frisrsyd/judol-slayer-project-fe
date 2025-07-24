import * as React from "react";
import { Box, Button } from "@mui/material";
import { Delete, Download, RemoveRedEye } from "@mui/icons-material";
import { KatanaIcon } from "../../../public/katana";
import { Comment, LogEntry } from "../../hooks/useCommentManagement";

interface ActionButtonsProps {
  isTokenAvailable: boolean;
  loading: boolean;
  logList: LogEntry[];
  detectedCommentList: Comment[];
  handleDetectJudolComments: () => void;
  handleDeleteJudolComments: () => void;
  handleDownloadLogFile: () => void;
  setLogList: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

export default function ActionButtons({
  isTokenAvailable,
  loading,
  logList,
  detectedCommentList,
  handleDetectJudolComments,
  handleDeleteJudolComments,
  handleDownloadLogFile,
  setLogList,
}: ActionButtonsProps) {
  if (!isTokenAvailable) return null;

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flexDirection={{ xs: "column", sm: "row" }}
      gap={1.5}
    >
      {/* Log Controls */}
      {!!logList.length ? (
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexDirection={{ xs: "column", sm: "row" }}
          width={"100%"}
          gap={1}
        >
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete width={20} height={20} />}
            disabled={loading}
            onClick={() => setLogList([])}
            fullWidth
          >
            Clear Log
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<Download width={20} height={20} />}
            disabled={loading}
            onClick={handleDownloadLogFile}
            fullWidth
          >
            Download Log file
          </Button>
        </Box>
      ) : null}

      {/* Main Action Buttons */}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexDirection={{ xs: "column", sm: "row" }}
        width={"100%"}
        gap={1}
        mb={{
          xs: logList.length > 0 ? 0 : 20,
          sm: logList.length > 0 ? 0 : 20,
          md: 0,
        }}
      >
        <Button
          variant="contained"
          color={"success"}
          startIcon={<RemoveRedEye width={20} height={20} />}
          disabled={loading}
          onClick={handleDetectJudolComments}
          fullWidth
        >
          Detect Judol Comments
        </Button>
        {detectedCommentList.length > 0 ? (
          <Button
            variant="contained"
            color={"warning"}
            startIcon={<KatanaIcon width={20} height={20} />}
            disabled={loading}
            onClick={handleDeleteJudolComments}
            fullWidth
          >
            Confirm Delete Judol Comments
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
