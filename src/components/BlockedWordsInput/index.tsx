import * as React from "react";
import { Autocomplete, Grid, TextField } from "@mui/material";

interface BlockedWordsInputProps {
  blockedWords: string[];
  loading: boolean;
  showStrictMode: boolean;
  onBlockedWordsChange: (updatedWords: string[]) => void;
}

export default function BlockedWordsInput({
  blockedWords,
  loading,
  showStrictMode,
  onBlockedWordsChange,
}: BlockedWordsInputProps) {
  return (
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
  );
}
