import * as React from "react";
import { Box } from "@mui/material";
import LogDisplay from "../LogDisplay";
import DetectedCommentsDisplay from "../DetectedCommentsDisplay";
import { Comment, LogEntry } from "../../hooks/useCommentManagement";

interface LogAndCommentsSectionProps {
  logList: LogEntry[];
  detectedCommentList: Comment[];
  handleCommentCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function LogAndCommentsSection({
  logList,
  detectedCommentList,
  handleCommentCheckboxChange,
}: LogAndCommentsSectionProps) {
  if (!logList.length && !detectedCommentList.length) return null;
  console.log("detectedCommentList", detectedCommentList);

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      gap={1.5}
      flexDirection={{ xs: "column", sm: "row" }}
      sx={{ mb: { xs: 12, sm: 2 } }}
    >
      {!logList.length ? null : <LogDisplay logList={logList} />}
      {!detectedCommentList.length ? null : (
        <DetectedCommentsDisplay
          detectedCommentList={detectedCommentList}
          handleCommentCheckboxChange={handleCommentCheckboxChange}
        />
      )}
    </Box>
  );
}
