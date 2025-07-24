import * as React from "react";

export interface AlertProps {
  isopen: boolean;
  type?: "success" | "error" | "info" | "warning";
  message?: string;
  progress?: number;
}

export interface UseJudolSlayerProps {
  platform: "youtube" | "instagram" | "main";
}

export function useJudolSlayer({ platform }: UseJudolSlayerProps) {
  const [blockedWords, setBlockedWords] = React.useState<string[]>([]);
  const [isTokenAvailable, setIsTokenAvailable] =
    React.useState<boolean>(false);
  const [isRefreshTokenAvailable, setIsRefreshTokenAvailable] =
    React.useState<boolean>(false);
  const [isLogout, setIsLogout] = React.useState<boolean>(false);
  const [logList, setLogList] = React.useState<string[]>([]);
  const [detectedCommentList, setDetectedCommentList] = React.useState<
    { commentId: string; commentText: string; mustBeDelete: boolean }[]
  >([]);
  const [loginLoading, setLoginLoading] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [strictMode, setStrictMode] = React.useState<boolean>(true);
  const [alert, setAlert] = React.useState<AlertProps>({
    isopen: false,
    type: "info",
    message: "",
    progress: 0,
  });

  const env = process.env.NODE_ENV;

  const handleCloseAlert = () => {
    setAlert({ ...alert, isopen: false });
  };

  // Common OAuth redirect handling
  React.useEffect(() => {
    if (window.opener && window.location.search.includes("code=")) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        window.opener.postMessage({ code }, window.location.origin);
        if (platform !== "youtube") {
          setTimeout(() => window.close(), 100);
        } else {
          window.close();
        }
      }
    } else if (
      window.location.search.includes("code=") &&
      platform !== "main"
    ) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        setTimeout(async () => {
          if (!isTokenAvailable) {
            setLoginLoading(true);
            try {
              const apiEndpoint =
                platform === "instagram"
                  ? "/api/instagram-oauth"
                  : "/api/google-oauth";

              const tokenResponse = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
              });

              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                env !== "production" &&
                  console.log("Token response from server:", tokenData);
                setAlert({
                  isopen: true,
                  type: "success",
                  message:
                    tokenData?.message ||
                    "Login successful! Judol Slayer is ready to slay!",
                });
                tokenIsValid();
                setLoginLoading(false);
              } else {
                const errorData = await tokenResponse.json();
                env !== "production" &&
                  console.error("Error exchanging code for tokens:", errorData);
                setAlert({
                  isopen: true,
                  type: "error",
                  message:
                    errorData?.error + ". Login failed. Please try again!",
                });
                setLoginLoading(false);
              }
            } catch (error) {
              env !== "production" && console.error("Error logging in:", error);
              setAlert({
                isopen: true,
                type: "error",
                message: "Login failed. Please try again.",
              });
              setLoginLoading(false);
            }
            tokenIsValid();
          }
        }, 100);
      }
    }
  }, []);

  // Alert progress effect
  React.useEffect(() => {
    if (alert.isopen) {
      setAlert((prev) => ({ ...prev, progress: 100 }));
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, progress: 0 }));
      }, 10000);

      const progressInterval = setInterval(() => {
        setAlert((prev) => {
          const newProgress = (prev.progress ?? 0) - 2;
          if (newProgress < 0) {
            clearInterval(progressInterval);
            return { ...prev, progress: 0, isopen: false };
          }
          return { ...prev, progress: newProgress };
        });
      }, 200);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [alert.isopen]);

  // Alert message effect
  React.useEffect(() => {
    if (alert.isopen) {
      setAlert((prev) => ({ ...prev, isopen: false }));
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, isopen: true }));
      }, 50);
    }
  }, [alert.message]);

  // Loading effect
  React.useEffect(() => {
    setLoading(loginLoading);
  }, [loginLoading]);

  // Token validation
  const tokenIsValid = async () => {
    try {
      const apiEndpoint =
        platform === "instagram"
          ? "/api/instagram/token/verify"
          : "/api/token/verify";

      const response = await fetch(apiEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      env !== "production" && console.log("Response from server:", data);

      if (data.isValid) {
        setIsTokenAvailable(true);
      } else {
        setIsTokenAvailable(false);
      }

      if (data.haveRefreshToken) {
        setIsRefreshTokenAvailable(true);
      } else {
        setIsRefreshTokenAvailable(false);
      }
    } catch (error) {
      env !== "production" && console.error("Error getting token:", error);
    }
  };

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

  // Handle login
  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      const apiEndpoint =
        platform === "instagram" ? "/api/instagram-oauth" : "/api/google-oauth";

      const response = await fetch(apiEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data?.url) {
        const popup = window.open(data.url, "_blank", "width=600,height=600");

        if (platform === "youtube") {
          let popupCheckInterval: NodeJS.Timeout | null = null;

          const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            const { code } = event.data || {};
            if (code) {
              window.removeEventListener("message", handleMessage);
              if (popupCheckInterval) clearInterval(popupCheckInterval);
              popup?.close();

              const tokenResponse = await fetch("/api/google-oauth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
              });
              const tokenData = await tokenResponse.json();
              env !== "production" &&
                console.log("Token response from server:", tokenData);
              setAlert({
                isopen: true,
                type: "success",
                message:
                  tokenData?.message ||
                  "Login successful! Judol Slayer is ready to slay!",
              });
              tokenIsValid();
              setLoginLoading(false);
            }
          };
          window.addEventListener("message", handleMessage);

          popupCheckInterval = setInterval(() => {
            if (popup && popup.closed) {
              window.removeEventListener("message", handleMessage);
              if (popupCheckInterval) clearInterval(popupCheckInterval);
              env !== "production" &&
                console.error(
                  "Popup closed before completing the login process."
                );
              setLoginLoading(false);
            }
          }, 1000);
        } else {
          // For Instagram and main page
          const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            const { code } = event.data || {};
            if (code) {
              window.removeEventListener("message", handleMessage);
              popup?.close();

              const tokenResponse = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
              });
              const tokenData = await tokenResponse.json();
              env !== "production" &&
                console.log("Token response from server:", tokenData);
              setAlert({
                isopen: true,
                type: "success",
                message:
                  tokenData?.message ||
                  "Login successful! Judol Slayer is ready to slay!",
              });
              tokenIsValid();
              setLoginLoading(false);
            }
          };
          window.addEventListener("message", handleMessage);
        }
      } else {
        env !== "production" && console.log(data.message);
        tokenIsValid();
        setLoginLoading(false);
        setAlert({
          isopen: true,
          type: "info",
          message: data.message || "Judol Slayer is ready to slay!",
        });
      }
    } catch (error) {
      setLoginLoading(false);
      env !== "production" && console.error("Error logging in:", error);
      setAlert({
        isopen: true,
        type: "error",
        message: "Login failed. Please try again.",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoginLoading(true);

      const deleteEndpoints =
        platform === "instagram"
          ? ["/api/instagram/token/delete", "/api/instagram-oauth-revoke"]
          : platform === "youtube"
          ? ["/api/token/delete", "/api/google-oauth-revoke"]
          : [];

      Promise.all(
        deleteEndpoints.map((endpoint) =>
          fetch(endpoint, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          })
        )
      )
        .then((responses) => {
          setIsLogout(true);
          setLoginLoading(false);
          setAlert({
            isopen: true,
            type: "success",
            message: "Logout successful! see you next time slayer!",
          });
        })
        .catch((error) => {
          setLoginLoading(false);
          env !== "production" && console.error("Error during logout:", error);
          setAlert({
            isopen: true,
            type: "error",
            message: "Logout failed. Please try again.",
          });
        });
    } catch (error) {
      setLoginLoading(false);
      env !== "production" && console.error("Error logging out:", error);
      setAlert({
        isopen: true,
        type: "error",
        message: "Logout failed. Please try again.",
      });
    }
  };

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

  // Detect Judol comments
  const handleDetectJudolComments = async () => {
    setDetectedCommentList([]);
    setLoading(true);

    const apiEndpoint =
      platform === "instagram"
        ? "/api/instagram/do-detect-judol-comments"
        : "/api/do-detect-judol-comments";

    const eventSource = new EventSource(apiEndpoint);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.log) {
        setLogList((prevLogs) => [...prevLogs, data.log]);
      }
      if (data.detectedComment) {
        setDetectedCommentList((prevComments) => [
          ...prevComments,
          data.detectedComment,
        ]);
      }
      env !== "production" && console.log("Received data:", data);
      if (data.message) {
        setAlert({
          isopen: true,
          type: "success",
          message: data.message,
        });
      }
    };

    eventSource.onerror = (error) => {
      eventSource.close();
    };

    eventSource.onopen = () => {
      env !== "production" && console.log("SSE connection opened.");
    };
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

  // Download log file
  const handleDownloadLogFile = async () => {
    try {
      const response = await fetch("/api/comments/download-log-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logList }),
      });
      const data = await response.blob();
      env !== "production" && console.log("Response from server:", data);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      const filename = `judol-slayer-log-${new Date().toISOString()}.txt`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setAlert({
        isopen: true,
        type: "success",
        message: "Log file downloaded successfully!",
      });
    } catch (error) {
      env !== "production" &&
        console.error("Error downloading log file:", error);
      setAlert({
        isopen: true,
        type: "error",
        message: "Error downloading log file. Please try again.",
      });
    }
  };

  // Handle comment checkbox change
  const handleCommentCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const commentId = event.target.value;
    const mustBeDelete = event.target.checked;

    setDetectedCommentList((prevComments) =>
      prevComments.map((comment) =>
        comment.commentId === commentId
          ? { ...comment, mustBeDelete: mustBeDelete }
          : comment
      )
    );
  };

  // Delete Judol comments
  const handleDeleteJudolComments = async () => {
    setLoading(true);

    const commentIdsToDelete = detectedCommentList
      .filter((c) => c.mustBeDelete)
      .map((c) => c.commentId);

    if (commentIdsToDelete.length === 0) {
      setAlert({
        isopen: true,
        type: "warning",
        message: "No comments selected for deletion.",
      });
      setLoading(false);
      return;
    }

    const apiEndpoint =
      platform === "instagram"
        ? "/api/instagram/do-delete-judol-comments"
        : "/api/do-delete-judol-comments";

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentIds: commentIdsToDelete }),
    });

    if (!response.body) {
      setAlert({
        isopen: true,
        type: "error",
        message: "No response from server.",
      });
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.trim()) continue;
        const dataLine = event
          .split("\n")
          .find((line) => line.startsWith("data:"));
        if (!dataLine) continue;
        const data = JSON.parse(dataLine.replace("data: ", ""));
        if (data.log) setLogList((prev) => [...prev, data.log]);
        if (data.message) {
          setAlert({
            isopen: true,
            type: "success",
            message: data.message,
          });
          setDetectedCommentList([]);
        }
      }
    }
  };

  // Strict mode handlers (only for YouTube and Instagram)
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

  // Effects
  React.useEffect(() => {
    getBlockedWords();
  }, []);

  React.useEffect(() => {
    tokenIsValid();
    getBlockedWords();
    if (!!logList.length) {
      setLoading(false);
    }
  }, [logList]);

  React.useEffect(() => {
    if (platform !== "main") {
      getStrictMode();
    }
  }, []);

  React.useEffect(() => {
    env !== "production" &&
      console.log("Comments to delete:", detectedCommentList);
  }, [detectedCommentList]);

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
