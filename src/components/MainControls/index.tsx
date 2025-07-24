import * as React from "react";
import { Box, Grid } from "@mui/material";
import BlockedWordsInput from "../BlockedWordsInput";
import StrictModeSwitch from "../StrictModeSwitch";

interface MainControlsProps {
  blockedWords: string[];
  strictMode: boolean;
  loading: boolean;
  isTokenAvailable: boolean;
  showStrictMode?: boolean;
  onBlockedWordsChange: (updatedWords: string[]) => void;
  handleStrictModeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MainControls({
  blockedWords,
  strictMode,
  loading,
  isTokenAvailable,
  showStrictMode = false,
  onBlockedWordsChange,
  handleStrictModeChange,
}: MainControlsProps) {
  return (
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
        <BlockedWordsInput
          blockedWords={blockedWords}
          loading={loading}
          showStrictMode={showStrictMode}
          onBlockedWordsChange={onBlockedWordsChange}
        />

        {showStrictMode && handleStrictModeChange && (
          <StrictModeSwitch
            strictMode={strictMode}
            handleStrictModeChange={handleStrictModeChange}
          />
        )}
      </Grid>
    </Box>
  );
}
