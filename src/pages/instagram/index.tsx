import MainLayout from "@/layouts/main";
import Navigation from "@/components/Navigation";
import JudolSlayerUI from "@/components/JudolSlayerUI";
import { useJudolSlayer } from "@/hooks/useJudolSlayer";
import * as React from "react";

export default function Instagram() {
  const judolSlayer = useJudolSlayer({ platform: "instagram" });

  return (
    <MainLayout title="Judol Slayer - Instagram">
      <Navigation
        isTokenAvailable={judolSlayer.isTokenAvailable}
        loginLoading={judolSlayer.loginLoading}
        loading={judolSlayer.loading}
        currentPlatform="instagram"
        handleLogin={judolSlayer.handleLogin}
        handleLogout={judolSlayer.handleLogout}
      />

      <JudolSlayerUI
        blockedWords={judolSlayer.blockedWords}
        isTokenAvailable={judolSlayer.isTokenAvailable}
        loading={judolSlayer.loading}
        loginLoading={judolSlayer.loginLoading}
        logList={judolSlayer.logList}
        detectedCommentList={judolSlayer.detectedCommentList}
        strictMode={judolSlayer.strictMode}
        alert={judolSlayer.alert}
        onBlockedWordsChange={judolSlayer.onBlockedWordsChange}
        handleDetectJudolComments={judolSlayer.handleDetectJudolComments}
        handleDeleteJudolComments={judolSlayer.handleDeleteJudolComments}
        handleDownloadLogFile={judolSlayer.handleDownloadLogFile}
        handleCommentCheckboxChange={judolSlayer.handleCommentCheckboxChange}
        handleStrictModeChange={judolSlayer.handleStrictModeChange}
        handleCloseAlert={judolSlayer.handleCloseAlert}
        setLogList={judolSlayer.setLogList}
        showStrictMode={true} // Instagram uses strict mode
        platform="instagram"
      />
    </MainLayout>
  );
}
