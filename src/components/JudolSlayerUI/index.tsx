import * as React from "react";
import AlertComponent from "../Alert";
import LoadingOverlay from "../LoadingOverlay";
import MainControls from "../MainControls";
import ActionButtons from "../ActionButtons";
import LogAndCommentsSection from "../LogAndCommentsSection";
import { AlertProps } from "../../hooks/useAlert";
import { Comment, LogEntry } from "../../hooks/useCommentManagement";

interface JudolSlayerUIProps {
  // State
  blockedWords: string[];
  isTokenAvailable: boolean;
  loading: boolean;
  loginLoading: boolean;
  logList: LogEntry[];
  detectedCommentList: Comment[];
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
  handleCloseAlert: () => void;
  setLogList: React.Dispatch<React.SetStateAction<LogEntry[]>>;

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
  handleCloseAlert,
  setLogList,
  showStrictMode = false,
  platform,
}: JudolSlayerUIProps) {
  return (
    <>
      <AlertComponent alert={alert} onClose={handleCloseAlert} />
      <LoadingOverlay loading={loginLoading || loading} />

      <MainControls
        blockedWords={blockedWords}
        strictMode={strictMode}
        loading={loading}
        isTokenAvailable={isTokenAvailable}
        showStrictMode={showStrictMode}
        onBlockedWordsChange={onBlockedWordsChange}
        handleStrictModeChange={handleStrictModeChange}
      />

      {platform !== "main" ? (
        <ActionButtons
          isTokenAvailable={isTokenAvailable}
          loading={loading}
          logList={logList}
          detectedCommentList={detectedCommentList}
          handleDetectJudolComments={handleDetectJudolComments}
          handleDeleteJudolComments={handleDeleteJudolComments}
          handleDownloadLogFile={handleDownloadLogFile}
          setLogList={setLogList}
        />
      ) : null}

      <LogAndCommentsSection
        logList={logList}
        detectedCommentList={detectedCommentList}
        handleCommentCheckboxChange={handleCommentCheckboxChange}
      />
    </>
  );
}
