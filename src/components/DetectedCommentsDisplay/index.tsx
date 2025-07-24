import * as React from "react";
import { Box, Checkbox, Typography } from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import { Comment } from "../../hooks/useCommentManagement";

interface DetectedCommentsDisplayProps {
  detectedCommentList: Comment[];
  handleCommentCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function DetectedCommentsDisplay({
  detectedCommentList,
  handleCommentCheckboxChange,
}: DetectedCommentsDisplayProps) {
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
        px: 2,
        pb: 2,
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
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: "bold",
          color: "#383838",
          position: "sticky",
          top: 0,
          bgcolor: "rgba(255, 255, 255)",
          zIndex: 1,
          pt: 2,
        }}
      >
        {`Detected Judol Comments (${detectedCommentList.length})`}
      </Typography>
      <Virtuoso
        style={{ height: window.innerHeight * 0.35 }}
        totalCount={detectedCommentList.length}
        itemContent={(index) => {
          const comment = detectedCommentList[index];
          return (
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: "100%" }}
            >
              <Checkbox
                value={comment.commentId}
                onChange={handleCommentCheckboxChange}
                defaultChecked={comment.mustBeDelete}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "4px",
                  padding: "8px",
                  width: "100%",
                }}
              >
                {comment.commentText}
              </Typography>
            </Box>
          );
        }}
      />
    </Box>
  );
}
