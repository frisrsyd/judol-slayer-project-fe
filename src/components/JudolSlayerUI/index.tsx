import * as React from "react";
import AlertComponent from "../Alert";
import LoadingOverlay from "../LoadingOverlay";
import MainControls from "../MainControls";
import ActionButtons from "../ActionButtons";
import LogAndCommentsSection from "../LogAndCommentsSection";
import { AlertProps } from "../../hooks/useAlert";
import { Comment } from "../../hooks/useCommentManagement";

interface JudolSlayerUIProps {
  // State
  blockedWords: string[];
  isTokenAvailable: boolean;
  loading: boolean;
  loginLoading: boolean;
  logList: string[];
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
      <AlertComponent alert={alert} />
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

      <LogAndCommentsSection
        logList={logList}
        detectedCommentList={detectedCommentList}
        handleCommentCheckboxChange={handleCommentCheckboxChange}
      />
    </>
  );
}
