import * as React from "react";
import { Box } from "@mui/material";
import LogDisplay from "../LogDisplay";
import DetectedCommentsDisplay from "../DetectedCommentsDisplay";
import { Comment } from "../../hooks/useCommentManagement";

interface LogAndCommentsSectionProps {
  logList: string[];
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
  if (!logList.length) return null;

  return (
    <Box
      display={"flex"}
      justifyContent={"space-between"}
      gap={1.5}
      flexDirection={{ xs: "column", sm: "row" }}
      sx={{ mb: 20 }}
    >
      <LogDisplay logList={logList} />
      <DetectedCommentsDisplay
        detectedCommentList={detectedCommentList}
        handleCommentCheckboxChange={handleCommentCheckboxChange}
      />
    </Box>
  );
}
