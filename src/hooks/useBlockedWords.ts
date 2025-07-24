import * as React from "react";
import { AlertProps } from "./useAlert";

export interface UseBlockedWordsProps {
  setAlert: (alert: AlertProps) => void;
}

export function useBlockedWords({ setAlert }: UseBlockedWordsProps) {
  const [blockedWords, setBlockedWords] = React.useState<string[]>([]);
  const env = process.env.NODE_ENV;

  // Get blocked words
  const getBlockedWords = async () => {
    try {
      const response = await fetch("/api/blocked-words/read", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      env !== "production" && console.log("Response from server:", data);
      env !== "production" && console.log("Blocked words:", data.blockedWords);
      setBlockedWords(data.blockedWords);
    } catch (error) {
      env !== "production" &&
        console.error("Error getting blockedWords:", error);
    }
  };

  // Handle blocked words change
  const onBlockedWordsChange = async (updatedWords: string[]) => {
    env !== "production" && console.log("Blocked words changed:", updatedWords);
    setBlockedWords(updatedWords);

    try {
      const response = await fetch("/api/blocked-words/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedWords: updatedWords }),
      });

      const data = await response.json();
      env !== "production" && console.log("Response from server:", data);
      if (response.ok) {
        setAlert({
          isopen: true,
          type: "success",
          message: "Blocked words saved successfully!",
        });
      }
      if (data.error) {
        setAlert({
          isopen: true,
          type: "error",
          message: data.error || "Error saving blocked words.",
        });
      }
    } catch (error) {
      env !== "production" &&
        console.error("Error saving blocked words:", error);
      setAlert({
        isopen: true,
        type: "error",
        message: "Error saving blocked words. Please try again.",
      });
    }
  };

  // Initialize blocked words on mount
  React.useEffect(() => {
    getBlockedWords();
  }, []);

  return {
    blockedWords,
    setBlockedWords,
    getBlockedWords,
    onBlockedWordsChange,
  };
}
