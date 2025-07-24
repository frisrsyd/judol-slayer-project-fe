import * as React from "react";
import { Grid, Stack, Switch, Typography } from "@mui/material";

interface StrictModeSwitchProps {
  strictMode: boolean;
  handleStrictModeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function StrictModeSwitch({
  strictMode,
  handleStrictModeChange,
}: StrictModeSwitchProps) {
  return (
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
        *Strict mode will detect suspicious comments as Judol comments, but
        there is a chance that it will detect false positives(eg: ²), you can
        uncheck the comments that you don't want to delete on the detected
        comments list after detecting Judol comments and it will not delete
        them.
      </Typography>
    </Grid>
  );
}
