import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import {
  ArrowBack,
  Close,
  Delete,
  Download,
  Instagram,
  Logout,
  RemoveRedEye,
} from "@mui/icons-material";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { KatanaIcon } from "../../../public/katana";
import CircularText from "@/components/CircularText";
import BlurText from "@/components/BlurText";
import Link from "next/link";
import { Virtuoso } from "react-virtuoso";
import { GetServerSidePropsContext } from "next";
import Footer from "@/components/partials/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface AlertProps {
  isopen: boolean;
  type?: "success" | "error" | "info" | "warning";
  message?: string;
  progress?: number;
}

export default function Home() {
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

  const handleCloseAlert = () => {
    setAlert({ ...alert, isopen: false });
  };

  const env = process.env.NODE_ENV;

  React.useEffect(() => {
    // If this window was opened as a popup and has a code param, send it to the opener
    if (window.opener && window.location.search.includes("code=")) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        window.opener.postMessage({ code }, window.location.origin);
        setTimeout(() => window.close(), 100); // Give time for message to be sent
      }
    } else if (window.location.search.includes("code=")) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        setTimeout(async () => {
          if (!isTokenAvailable) {
            setLoginLoading(true);
            try {
              const tokenResponse = await fetch("/api/instagram-oauth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
              });
              const tokenData = await tokenResponse.json();
              env !== "production" &&
                console.log("Token response from server:", tokenData);
              if (tokenResponse.ok) {
                setAlert({
                  isopen: true,
                  type: "success",
                  message:
                    tokenData?.message ||
                    "Login successful! Judol Slayer is ready to slay!",
                });
                setLoginLoading(false);
              } else {
                setAlert({
                  isopen: true,
                  type: "error",
                  message: "Login failed. Please try again.",
                });
                setTimeout(() => {
                  window.open(window.location.pathname, "_self");
                }, 2000); // Redirect to the same page after 2 seconds
              }
            } catch (error) {
              env !== "production" &&
                console.error("Error logging in with Google:", error);
              setAlert({
                isopen: true,
                type: "error",
                message: "Login failed. Please try again.",
              });
              setLoginLoading(false);
            }
            tokenIsValid();
          }
        }, 100); // Give time for message to be sent
      }
    }
  }, []);

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

  React.useEffect(() => {
    // Close the previous alert if there's a new one, then open the latest alert
    if (alert.isopen) {
      setAlert((prev) => ({ ...prev, isopen: false }));
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, isopen: true }));
      }, 50); // Small delay to allow the alert to close before reopening
    }
  }, [alert.message]);

  React.useEffect(() => {
    setLoading(loginLoading);
  }, [loginLoading]);

  const tokenIsValid = async () => {
    try {
      const response = await fetch("/api/instagram/token/verify", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

  const getBlockedWords = async () => {
    try {
      const response = await fetch("/api/blocked-words/read", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

  React.useEffect(() => {
    getBlockedWords();
  }, []);

  const handleLoginOauthInstagram = async () => {
    try {
      setLoginLoading(true);
      const response = await fetch("/api/instagram-oauth", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data?.url) {
        const popup = window.open(data.url, "_blank", "width=600,height=600");
        let popupCheckInterval: NodeJS.Timeout | null = null;

        // Listen for the code from the popup
        const handleMessage = async (event: MessageEvent) => {
          // if (event.origin !== window.location.origin) return;
          const { code } = event.data || {};
          if (code) {
            window.removeEventListener("message", handleMessage);
            if (popupCheckInterval) clearInterval(popupCheckInterval);
            popup?.close();

            // Exchange code for tokens
            const tokenResponse = await fetch("/api/instagram-oauth", {
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
                  errorData?.error +
                  ". Login failed. Please try again!. If you see this error multiple times, please contact the developer.",
              });
              setLoginLoading(false);
            }
          }
        };
        window.addEventListener("message", handleMessage);

        // Fallback: check if popup is closed before code is received
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
        }, 500);
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
      env !== "production" &&
        console.error("Error logging in with Instagram:", error);
      setAlert({
        isopen: true,
        type: "error",
        message: "Login failed. Please try again.",
      });
    }
  };

  const handleLoginOauthInstagramMock = async () => {
    try {
      setLoginLoading(true);

      const code =
        "AQCMIQYZ3uDeTDTO_LN2EaRO7xSx2IV0Tmnf5MgC5yH7FqKQX5X93QCXElGRBXiLJTfHNuugL6PkQStO6PTjmJl9MG0fEurD_8hzMpL5xyQJ8-hrZHhedmbaU2UwbwI3NYfDOXLvUyUfiVzAPmvBql5xVOI_qRrrJN0Ef-v3sFOJ86x1inyiAPznk9JHzhP_kTXvr5psK_w8rZjOSwXrkQ9QFWdib6_mA1WHekrkGoSCgA#_";

      if (code) {
        // Exchange code for tokens
        const tokenResponse = await fetch("/api/instagram-oauth", {
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
              errorData?.error +
              ". Login failed. Please try again!. if you see this error multiple times, please contact the developer.",
          });
          setLoginLoading(false);
        }
      }
    } catch (error) {
      setLoginLoading(false);
      env !== "production" &&
        console.error("Error logging in with Instagram:", error);
      setAlert({
        isopen: true,
        type: "error",
        message: "Login failed. Please try again.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      setLoginLoading(true);
      Promise.all([
        fetch("/api/instagram/token/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/instagram-oauth-revoke", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ])
        .then((responses) => {
          responses.forEach((response) => {
            if (!response.ok) {
              setLoginLoading(false);
              throw new Error("Network response was not ok");
            }
          });
          env !== "production" && console.log("Logout successful");
          setIsLogout(true);
          setLoginLoading(false);
          // window.open("https://myaccount.google.com/permissions", "_blank");
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

  const handleDetectJudolComments = async () => {
    // setLogList([]);
    setDetectedCommentList([]);
    setLoading(true);
    // const eventSource = new EventSource("/api/do-delete-judol-comments-new");
    const eventSource = new EventSource(
      "/api/instagram/do-detect-judol-comments"
    );

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
          message: data.message || "Judol Slayer is ready to slay!",
        });
      }
    };

    eventSource.onerror = (error) => {
      // env !== "production" && console.error("Error with SSE:", error);
      // setLogList((prevLogs) => [...prevLogs, "❌ An error occurred."]);
      // setAlert({
      //   isopen: true,
      //   type: "error",
      //   message: "An error occurred while deleting Judol comments.",
      // });
      eventSource.close();
    };

    eventSource.onopen = () => {
      env !== "production" && console.log("SSE connection opened.");
    };
  };

  const onBlockedWordsChange = async (updatedWords: string[]) => {
    env !== "production" && console.log("Blocked words changed:", updatedWords);
    setBlockedWords(updatedWords);

    try {
      const response = await fetch("/api/blocked-words/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  React.useEffect(() => {
    tokenIsValid();
    getBlockedWords();
    if (!!logList.length) {
      setLoading(false);
    }
  }, [logList]);

  const handleDownloadLogFile = async () => {
    try {
      const response = await fetch("/api/comments/download-log-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  React.useEffect(() => {
    env !== "production" &&
      console.log("Comments to delete:", detectedCommentList);
  }, [detectedCommentList]);

  // Add this inside your Home component in index.tsx

  const handleDeleteJudolComments = async () => {
    // setLogList([]);
    setLoading(true);

    // Only send IDs that are checked for deletion
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

    // Use fetch + ReadableStream for SSE with POST
    const response = await fetch("/api/instagram/do-delete-judol-comments", {
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

      // Split by double newlines (SSE event delimiter)
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
          // setLoading(false);
          // Optionally clear detectedCommentList here
          // handleDetectJudolComments(); // Refresh detected comments after deletion
          setDetectedCommentList([]);
        }
      }
    }
    // setLoading(false);
  };

  const handleStrictModeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newStrictMode = event.target.checked;
    setStrictMode(newStrictMode);

    try {
      const response = await fetch("/api/strict-mode/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      env !== "production" && console.log("Response from server:", data);
      if (data.strictMode === null || data.strictMode === undefined) {
        handleStrictModeChange({
          target: { checked: strictMode },
        } as React.ChangeEvent<HTMLInputElement>);
      } else {
        setStrictMode(data.strictMode);
      }
    } catch (error) {
      env !== "production" &&
        console.error("Error getting strict mode:", error);
    }
  };
  React.useEffect(() => {
    getStrictMode();
  }, []);

  return (
    <>
      <Head>
        <title>Judol Slayer | Instagram</title>
        <meta
          name="description"
          content="Judol Slayer UI Project improvement"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="google-site-verification"
          content="eDhx04SCQ6SH_tjtQfb41rHqo3RtbBsY2YMfyyRvuSU"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <SpeedInsights />
        <main className={styles.main}>
          {alert.isopen ? (
            <Alert
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleCloseAlert}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              }
              sx={{
                animation: {
                  xs: "slideDown 1s ease-in-out",
                  sm: "slideIn 1s ease-in-out",
                },
                "@keyframes slideIn": {
                  "0%": { transform: "translateX(100%)", opacity: 0 },
                  "100%": { transform: "translateX(0)", opacity: 1 },
                },
                "@keyframes slideDown": {
                  "0%": { transform: "translateY(-100%)", opacity: 0 },
                  "100%": { transform: "translateY(0)", opacity: 1 },
                },
                position: "fixed", // Added position sticky
                top: 8, // Optional: to specify the sticky position
                zIndex: 10000, // Optional: to ensure it stays above other elements
                maxWidth: { xs: "100%", sm: "60%", md: "40%", lg: "30%" },
                right: 8,
                mr: { xs: 0, sm: 1.5 },
                left: { xs: 8, sm: "auto", md: "auto", lg: "auto" }, // Adjusted for smaller screens
              }}
              variant="filled"
              severity={alert.type || "info"}
            >
              {alert.message || "Judol Slayer is ready to slay!"}
              {/* {"Judol Slayer is ready to slay!"} */}
              <LinearProgress
                variant="determinate"
                color="inherit"
                value={alert.progress}
                sx={{ mt: 1 }}
              />
            </Alert>
          ) : null}
          {loginLoading || loading ? (
            <Box
              display={"flex"}
              justifyContent="center"
              alignItems={"center"}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
              }}
            >
              <CircularText
                text="LOADING*PLEASE*WAIT*"
                onHover="goBonkers"
                spinDuration={20}
                className="text-red-500"
                sx={{ color: "#383838" }}
              />
            </Box>
          ) : null}
          {/* <Typography
            sx={{ color: "#383838" }}
            textAlign={"center"}
            variant="h4"
          >
            Judol Slayer Project
          </Typography> */}

          <Box
            display={"flex"}
            justifyContent={"left"}
            alignItems={"center"}
            flexDirection={"column"}
            position={{ xs: "relative", lg: "absolute" }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "underline",
                color: "#383838",
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "left",
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: 50,
                padding: "8px 16px",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f5f5f5";
                (e.currentTarget as HTMLElement).style.background = "#383838";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#383838";
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <ArrowBack
                sx={{
                  ":hover": { bgcolor: "#383838", color: "#f5f5f5" },
                  borderRadius: 5,
                }}
              />
              Back to Home
            </Link>
          </Box>

          <Box
            display={"flex"}
            justifyContent={"center"}
            justifyItems={"center"}
            alignContent={"center"}
            alignItems={"center"}
            sx={{ width: "100%" }}
            gap={2}
          >
            <KatanaIcon width={34} height={34} color="#383838" />
            <BlurText
              text="Instagram Comment Slayer"
              delay={150}
              animateBy="words"
              direction="top"
              // onAnimationComplete={handleAnimationComplete}
              // className="text-2xl mb-8"
              sx={{
                fontSize: "34px",
                color: "#383838",
                fontWeight: "bold",
                textAlign: "center",
              }}
            />
            <KatanaIcon width={34} height={34} color="#383838" />
          </Box>
          {!isTokenAvailable ? (
            <Typography>
              You can{" "}
              <Typography
                component="a"
                color="primary"
                href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fmanage_access%2F&h=AT2JdOKQYUN92sY9ekuzAldOzbsn8MetjaXjjvND9x5jTzBCfKOU1TR8IEmu1Tv_KCLrSL3I4EuSlhgk6bup3ZZ5g7KWc-hPnT57lZ63XO1dmEHujnNZfmKIldR-YSeT9acjDw"
                target="_blank"
                sx={{ textDecoration: "underline" }}
              >
                Revoke This App Access
              </Typography>{" "}
              if you don't want to use this app anymore!
            </Typography>
          ) : null}

          <Box
            display={"flex"}
            justifyContent={!isTokenAvailable ? "space-between" : "end"}
            alignItems={"center"}
            flexDirection={"row"}
            gap={2}
          >
            <Button
              variant="contained"
              color="error"
              sx={{
                background: !isTokenAvailable
                  ? "radial-gradient(circle farthest-corner at 0% 150%, rgb(255, 225, 125) 0%, rgb(255, 205, 105) 12%, rgb(250, 145, 55) 25%, rgb(235, 65, 65) 41%, transparent 95%), linear-gradient(-15deg, rgb(35, 75, 215) -10%, rgb(195, 60, 190) 65%)"
                  : "",
              }}
              startIcon={!isTokenAvailable ? <Instagram /> : <Logout />}
              onClick={() => {
                !isTokenAvailable
                  ? handleLoginOauthInstagram()
                  : handleLogout();
              }}
              disabled={loginLoading || loading}
            >
              {!isTokenAvailable ? "Login with Instagram" : "Log Out"}
            </Button>
            {/* <Button
              variant="contained"
              color="error"
              startIcon={!isTokenAvailable ? <Instagram /> : <Logout />}
              onClick={() => {
                !isTokenAvailable
                  ? handleLoginOauthInstagramMock()
                  : handleLogout();
              }}
              disabled={loginLoading || loading}
            >
              {!isTokenAvailable ? "Login mock" : "Log Out"}
            </Button> */}
          </Box>
          <Box display={"flex"} flexDirection="column" gap={1.5}>
            <Grid
              container
              spacing={1.5}
              sx={{ width: "100%" }}
              justifyContent={"space-between"}
              columns={{ xs: 4, sm: 8, md: 12 }}
              mb={{
                xs: isTokenAvailable ? 0 : 20,
                sm: isTokenAvailable ? 0 : 20,
                md: 0,
              }}
            >
              <Grid size={{ xs: 4, sm: 8, md: 6 }}>
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
                      helperText="Input blocked words and press enter to add, programm will check the similarity, this only help to reduce the word you should enter, but not 100% accurate"
                    />
                  )}
                  onChange={(event, newValue) => {
                    onBlockedWordsChange(newValue); // newValue is array
                  }}
                  onInputChange={(event) => {
                    // setBlockedWords(event);
                    // onBlockedWordsChange(event);
                  }}
                  value={blockedWords}
                  freeSolo
                  multiple
                  // options={blockedWords}
                  limitTags={10}
                  slotProps={{
                    chip: {
                      size: "small",
                      color: "error",
                      // sx: {
                      //   backgroundColor: "#951e1e",
                      //   borderRadius: "8px",
                      //   marginRight: 1,
                      // },
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
              <Grid
                sx={{
                  bgcolor: "white",
                  borderRadius: "4px",
                  p: 1,
                }}
                size={{ xs: 4, sm: 8, md: 6 }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={"bold"}
                    sx={{ color: "#383838" }}
                  >
                    Strict Mode*
                  </Typography>
                  <Switch
                    checked={strictMode}
                    onChange={handleStrictModeChange}
                    slotProps={{
                      input: { "aria-label": "Strict Mode Switch" },
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight={"bold"}
                    color={strictMode ? "success" : "error"}
                  >
                    {strictMode ? "ON" : "OFF"}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{ color: "#383838", mt: 0.5, opacity: 0.8 }}
                >
                  *Strict mode will detect suspicious comments as Judol
                  comments, but there is a chance that it will detect false
                  positives(eg: ²), you can uncheck the comments that you don't
                  want to delete on the detected comments list after detecting
                  Judol comments and it will not delete them.
                </Typography>
              </Grid>
            </Grid>
            {isTokenAvailable ? (
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={1.5}
              >
                {!!logList.length ? (
                  <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    flexDirection={{ xs: "column", sm: "row" }}
                    width={"100%"}
                    gap={1}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Delete width={20} height={20} />}
                      disabled={loading}
                      onClick={() => {
                        setLogList([]);
                      }}
                      fullWidth
                    >
                      Clear Log
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<Download width={20} height={20} />}
                      disabled={loading}
                      onClick={() => {
                        handleDownloadLogFile();
                      }}
                      fullWidth
                    >
                      Download Log file
                    </Button>
                  </Box>
                ) : null}
                <Box
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  flexDirection={{ xs: "column", sm: "row" }}
                  width={"100%"}
                  gap={1}
                  mb={{
                    xs: logList.length > 0 ? 0 : 20,
                    sm: logList.length > 0 ? 0 : 20,
                    md: 0,
                  }}
                >
                  <Button
                    variant="contained"
                    color={"success"}
                    startIcon={<RemoveRedEye width={20} height={20} />}
                    disabled={loading}
                    onClick={() => {
                      handleDetectJudolComments();
                    }}
                    fullWidth
                  >
                    Detect Judol Comments
                  </Button>
                  {detectedCommentList.length > 0 ? (
                    <Button
                      variant="contained"
                      color={"warning"}
                      startIcon={<KatanaIcon width={20} height={20} />}
                      disabled={loading}
                      onClick={() => {
                        handleDeleteJudolComments();
                      }}
                      fullWidth
                    >
                      Confirm Delete Judol Comments
                    </Button>
                  ) : null}
                </Box>
              </Box>
            ) : null}
            {!!logList.length ? (
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                // alignItems={"center"}
                gap={1.5}
                flexDirection={{ xs: "column", sm: "row" }}
                sx={{ mb: 20 }}
              >
                <Box
                  display={"flex"}
                  flexDirection="column"
                  gap={1.5}
                  justifyContent={"left"}
                  alignItems={"left"}
                  sx={{
                    maxHeight: window.innerHeight * 0.35,
                    overflowY: "auto",
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "4px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(0, 0, 0, 0.1)",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: "rgba(0, 0, 0, 0.5)",
                    },
                  }}
                >
                  <Virtuoso
                    style={{ height: window.innerHeight * 0.35 }}
                    totalCount={logList.length}
                    itemContent={(index) => (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          backgroundColor: "white",
                          borderRadius: "4px",
                          padding: "8px",
                          width: "100%",
                        }}
                      >
                        {logList[index]}
                      </Typography>
                    )}
                  />
                </Box>
                <Box
                  display={"flex"}
                  flexDirection="column"
                  gap={1.5}
                  justifyContent={"left"}
                  alignItems={"left"}
                  sx={{
                    maxHeight: window.innerHeight * 0.35,
                    overflowY: "auto",
                    width: "100%",
                    px: 2,
                    pb: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "4px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(0, 0, 0, 0.1)",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(0, 0, 0, 0.3)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: "rgba(0, 0, 0, 0.5)",
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: "#383838",
                      position: "sticky",
                      top: 0,
                      bgcolor: "rgba(255, 255, 255)",
                      zIndex: 1,
                      pt: 2,
                    }}
                  >
                    {`Detected Judol Comments (${detectedCommentList.length})`}
                  </Typography>
                  <Virtuoso
                    style={{ height: window.innerHeight * 0.35 }}
                    totalCount={detectedCommentList.length}
                    itemContent={(index) => {
                      const comment = detectedCommentList[index];
                      return (
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ width: "100%" }}
                        >
                          <Checkbox
                            value={comment.commentId}
                            onChange={(e) => {
                              handleCommentCheckboxChange(e);
                            }}
                            defaultChecked={comment.mustBeDelete}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              backgroundColor: "white",
                              borderRadius: "4px",
                              padding: "8px",
                              width: "100%",
                            }}
                          >
                            {comment.commentText}
                          </Typography>
                        </Box>
                      );
                    }}
                  />
                </Box>
              </Box>
            ) : null}
          </Box>
        </main>
        <Footer />
      </div>
    </>
  );
}

// This function extracts the "code" parameter from the URL query string
// export async function getServerSideProps(context: GetServerSidePropsContext) {
//   const { query } = context;
//   const code = query.code || null;

//   // You can now use the "code" variable as needed (e.g., exchange for tokens, etc.)
//   // For demonstration, just return it as a prop
//   return {
//     props: {
//       code,
//     },
//   };
// }
