import MainLayout from "@/layouts/main";
import Navigation from "@/components/Navigation";
import JudolSlayerUI from "@/components/JudolSlayerUI";
import { useJudolSlayer } from "@/hooks/useJudolSlayer";
import * as React from "react";

export default function YouTube() {
  const judolSlayer = useJudolSlayer({ platform: "youtube" });

  return (
    <MainLayout title="Judol Slayer - YouTube">
      <Navigation
        isTokenAvailable={judolSlayer.isTokenAvailable}
        loginLoading={judolSlayer.loginLoading}
        loading={judolSlayer.loading}
        currentPlatform="youtube"
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
        setLogList={judolSlayer.setLogList}
        showStrictMode={false} // YouTube doesn't use strict mode
        platform="youtube"
      />
    </MainLayout>
  );
}
