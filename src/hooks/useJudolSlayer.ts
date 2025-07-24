import * as React from "react";
import { useAlert, AlertProps } from "./useAlert";
import { useAuth } from "./useAuth";
import { useBlockedWords } from "./useBlockedWords";
import { useCommentManagement } from "./useCommentManagement";
import { useStrictMode } from "./useStrictMode";

export interface UseJudolSlayerProps {
  platform: "youtube" | "instagram" | "main";
}

export type { AlertProps };

export function useJudolSlayer({ platform }: UseJudolSlayerProps) {
  const env = process.env.NODE_ENV;

  // Alert system
  const { alert, setAlert, handleCloseAlert } = useAlert();

  // Authentication
  const {
    isTokenAvailable,
    isRefreshTokenAvailable,
    isLogout,
    loginLoading,
    tokenIsValid,
    handleLogin,
    handleLogout,
    setIsTokenAvailable,
    setLoginLoading,
    setIsLogout,
  } = useAuth({ platform, setAlert });

  // Blocked words management
  const {
    blockedWords,
    setBlockedWords,
    getBlockedWords,
    onBlockedWordsChange,
  } = useBlockedWords({ setAlert });

  // Comment management
  const {
    logList,
    detectedCommentList,
    loading,
    handleDetectJudolComments,
    handleCommentCheckboxChange,
    handleDeleteJudolComments,
    handleDownloadLogFile,
    setLogList,
    setDetectedCommentList,
    setLoading,
  } = useCommentManagement({ platform, setAlert });

  // Strict mode management
  const { strictMode, setStrictMode, handleStrictModeChange, getStrictMode } =
    useStrictMode({ platform, setAlert });

  // Handle logout effect
  React.useEffect(() => {
    env !== "production" && console.log("isLogout:", isLogout);
    if (isLogout) {
      tokenIsValid();
      setLogList([]);
      setDetectedCommentList([]);
      setLoading(false);
      setIsLogout(false);
      setAlert({
        isopen: true,
        type: "info",
        message: "You have been logged out successfully.",
      });
    }
  }, [isLogout]);

  // Loading effect
  React.useEffect(() => {
    setLoading(loginLoading);
  }, [loginLoading]);

  // Initial data loading
  React.useEffect(() => {
    tokenIsValid();
    getBlockedWords();
    if (!!logList.length) {
      setLoading(false);
    }
  }, [logList]);

  return {
    // State
    blockedWords,
    isTokenAvailable,
    isRefreshTokenAvailable,
    isLogout,
    logList,
    detectedCommentList,
    loginLoading,
    loading,
    strictMode,
    alert,
    env,

    // Functions
    handleCloseAlert,
    tokenIsValid,
    getBlockedWords,
    handleLogin,
    handleLogout,
    handleDetectJudolComments,
    onBlockedWordsChange,
    handleDownloadLogFile,
    handleCommentCheckboxChange,
    handleDeleteJudolComments,
    handleStrictModeChange,
    getStrictMode,

    // Setters
    setLogList,
    setDetectedCommentList,
    setBlockedWords,
    setIsTokenAvailable,
    setLoginLoading,
    setLoading,
    setStrictMode,
    setAlert,
  };
}
