import MainLayout from "@/layouts/main";
import Navigation from "@/components/Navigation";
import JudolSlayerUI from "@/components/JudolSlayerUI";
import { useJudolSlayer } from "@/hooks/useJudolSlayer";
import * as React from "react";

export default function InstagramPage() {
  const judolSlayer = useJudolSlayer({ platform: "instagram" });

  return (
    <MainLayout
      title="Judol Slayer - Instagram Platform"
      description="Judol Slayer for Instagram comments - Clean your Instagram comments from spam"
    >
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
        setLogList={judolSlayer.setLogList}
        showStrictMode={true}
        platform="instagram"
      />
    </MainLayout>
  );
}
