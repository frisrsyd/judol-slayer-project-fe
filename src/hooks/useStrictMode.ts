import * as React from "react";
import { AlertProps } from "./useAlert";

export interface UseStrictModeProps {
  platform: "youtube" | "instagram" | "main";
  setAlert: (alert: AlertProps) => void;
}

export function useStrictMode({ platform, setAlert }: UseStrictModeProps) {
  const [strictMode, setStrictMode] = React.useState<boolean>(true);
  const env = process.env.NODE_ENV;

  // Handle strict mode change
  const handleStrictModeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newStrictMode = event.target.checked;
    setStrictMode(newStrictMode);

    try {
      const response = await fetch("/api/strict-mode/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strictMode: newStrictMode }),
      });

      const data = await response.json();
      env !== "production" && console.log("Response from server:", data);
      if (response.ok) {
        setAlert({
          isopen: true,
          type: "success",
          message: `Strict mode is now ${
            newStrictMode ? "enabled" : "disabled"
          }!`,
        });
      } else {
        setAlert({
          isopen: true,
          type: "error",
          message: data.error || "Error saving strict mode.",
        });
      }
    } catch (error) {
      env !== "production" && console.error("Error saving strict mode:", error);
      setAlert({
        isopen: true,
        type: "error",
        message: "Error saving strict mode. Please try again.",
      });
    }
  };

  // Get strict mode
  const getStrictMode = async () => {
    try {
      const response = await fetch("/api/strict-mode/read", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      env !== "production" && console.log("Response from server:", data);
      if (data.strictMode === null || data.strictMode === undefined) {
        handleStrictModeChange({
          target: { checked: true },
        } as React.ChangeEvent<HTMLInputElement>);
      } else {
        setStrictMode(data.strictMode);
      }
    } catch (error) {
      env !== "production" &&
        console.error("Error getting strict mode:", error);
    }
  };

  // Initialize strict mode for non-main platforms
  React.useEffect(() => {
    if (platform !== "main") {
      getStrictMode();
    }
  }, [platform]);

  return {
    strictMode,
    setStrictMode,
    handleStrictModeChange,
    getStrictMode,
  };
}
