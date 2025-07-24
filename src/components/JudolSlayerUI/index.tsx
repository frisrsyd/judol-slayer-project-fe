import * as React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  LinearProgress,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, Download, RemoveRedEye } from "@mui/icons-material";
import { Virtuoso } from "react-virtuoso";
import { KatanaIcon } from "../../../public/katana";
import CircularText from "../CircularText";
import { AlertProps } from "../../hooks/useJudolSlayer";

interface JudolSlayerUIProps {
  // State
  blockedWords: string[];
  isTokenAvailable: boolean;
  loading: boolean;
  loginLoading: boolean;
  logList: string[];
  detectedCommentList: {
    commentId: string;
    commentText: string;
    mustBeDelete: boolean;
  }[];
  strictMode: boolean;
  alert: AlertProps;

  // Functions
  onBlockedWordsChange: (updatedWords: string[]) => void;
  handleDetectJudolComments: () => void;
  handleDeleteJudolComments: () => void;
  handleDownloadLogFile: () => void;
  handleCommentCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleStrictModeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setLogList: React.Dispatch<React.SetStateAction<string[]>>;

  // Platform specific
  showStrictMode?: boolean;
  platform: "youtube" | "instagram" | "main";
}

export default function JudolSlayerUI({
  blockedWords,
  isTokenAvailable,
  loading,
  loginLoading,
  logList,
  detectedCommentList,
  strictMode,
  alert,
  onBlockedWordsChange,
  handleDetectJudolComments,
  handleDeleteJudolComments,
  handleDownloadLogFile,
  handleCommentCheckboxChange,
  handleStrictModeChange,
  setLogList,
  showStrictMode = false,
  platform,
}: JudolSlayerUIProps) {
  return (
    <>
      {/* Alert */}
      {alert.isopen ? (
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
      ) : null}

      {/* Loading Overlay */}
      {loginLoading || loading ? (
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
      ) : null}

      {/* Main Controls */}
      <Box display={"flex"} flexDirection="column" gap={1.5}>
        <Grid
          container
          spacing={1.5}
          sx={{ width: "100%" }}
          justifyContent={"space-between"}
          mb={{
            xs: isTokenAvailable ? 0 : 20,
            sm: isTokenAvailable ? 0 : 20,
            md: 0,
          }}
        >
          {/* Blocked Words Input */}
          <Grid size={{ xs: 12, sm: 12, md: showStrictMode ? 6 : 12 }}>
            <Autocomplete
              fullWidth
              disablePortal
              id="blocked-words"
              options={[]}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Blocked Words"
                  placeholder="Hit Enter to submit/save blocked words"
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "4px",
                  }}
                  helperText="Input blocked words and press enter to add, program will check the similarity, this only help to reduce the word you should enter, but not 100% accurate"
                />
              )}
              onChange={(event, newValue) => {
                onBlockedWordsChange(newValue);
              }}
              value={blockedWords}
              freeSolo
              multiple
              limitTags={10}
              slotProps={{
                chip: {
                  size: "small",
                  color: "error",
                },
                listbox: {
                  sx: {
                    backgroundColor: "white",
                    borderRadius: "4px",
                    maxHeight: "50dvh",
                    overflowY: "auto",
                  },
                },
              }}
            />
          </Grid>

          {/* Strict Mode Switch */}
          {showStrictMode && handleStrictModeChange && (
            <Grid
              sx={{
                bgcolor: "white",
                borderRadius: "4px",
                p: 1,
              }}
              size={{ xs: 4, sm: 8, md: 6 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={"bold"}
                  sx={{ color: "#383838" }}
                >
                  Strict Mode*
                </Typography>
                <Switch
                  checked={strictMode}
                  onChange={handleStrictModeChange}
                  slotProps={{
                    input: { "aria-label": "Strict Mode Switch" },
                  }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight={"bold"}
                  color={strictMode ? "success" : "error"}
                >
                  {strictMode ? "ON" : "OFF"}
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: "#383838", mt: 0.5, opacity: 0.8 }}
              >
                *Strict mode will detect suspicious comments as Judol comments,
                but there is a chance that it will detect false positives(eg:
                ²), you can uncheck the comments that you don't want to delete
                on the detected comments list after detecting Judol comments and
                it will not delete them.
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Action Buttons */}
        {isTokenAvailable && platform !== "main" ? (
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
        ) : null}

        {/* Log and Comments Display */}
        {!!logList.length ? (
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            gap={1.5}
            flexDirection={{ xs: "column", sm: "row" }}
            sx={{ mb: 20 }}
          >
            {/* Log List */}
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

            {/* Detected Comments */}
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
          </Box>
        ) : null}
      </Box>
    </>
  );
}
