import { CloudUploadOutlined } from "@mui/icons-material";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Upload({ ...props }) {
  const [file, setFile] = React.useState<FileList | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files : null;
    if (selectedFile) {
      setFile(selectedFile);
      console.log("Selected file:", selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFile(droppedFiles);
      console.log("Dropped file:", droppedFiles);
    }
  };

  // Add this function to prevent default drag-over behavior
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  React.useEffect(() => {
    props.onFileChange(file);
  }, [file]);

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="left"
      gap={2}
      onDragOver={handleDragOver} // Add this to the Box
      onDrop={handleDrop} // Add this to the Box
    >
      <label htmlFor={props.id || "upload-button"}>
        {props.label || (
          <>
            Upload JSON File (Credential you get from{" "}
            <Typography
              component="a"
              color="primary"
              href="https://console.cloud.google.com/"
              target="_blank"
              sx={{textDecoration: "underline"}} 
            >
              YouTube API v3 OAuth2
            </Typography>
            )
          </>
        )}
      </label>
      <Button
        id={props.id || "upload-button"}
        component="label"
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        startIcon={<CloudUploadOutlined />}
        sx={{
          width: props.width || "30dvw",
          height: props.height || "20dvw",
        }}
      >
        {props.btnLabel || "Upload JSON File or Drag and Drop"}
        <VisuallyHiddenInput
          type="file"
          accept={props.accept || ".json"}
          onChange={handleFileChange}
        />
      </Button>
    </Box>
  );
}
