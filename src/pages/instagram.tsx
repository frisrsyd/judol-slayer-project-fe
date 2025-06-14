import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import {
  ArrowBack,
  Close,
  Download,
  GitHub,
  Google,
  Instagram,
  Logout,
  RemoveRedEye,
  Web,
} from "@mui/icons-material";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { KatanaIcon } from "../../public/katana";
import CircularText from "@/components/CircularText";
import BlurText from "@/components/BlurText";
import Image from "next/image";
import { log } from "console";
import Link from "next/link";

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
        window.close();
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

        // Listen for the code from the popup
        const handleMessage = async (event: MessageEvent) => {
          // if (event.origin !== window.location.origin) return;
            const { code } = event.data || {};
          env !== "production" && console.log("Received code:", code);
          if (popup?.closed && !!code === false) {
            window.removeEventListener("message", handleMessage);
            env !== "production" &&
              console.error(
                "Popup closed before completing the login process."
              );
            setLoginLoading(false);
            return;
          }
          if (code) {
            window.removeEventListener("message", handleMessage);
            popup?.close();

            // Exchange code for tokens
            const tokenResponse = await fetch("/api/insagram-oauth", {
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
        fetch("/api/insagram-oauth-revoke", {
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
    const eventSource = new EventSource("/api/do-detect-judol-comments");

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
    const response = await fetch("/api/do-delete-judol-comments", {
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
                animation: "slideIn 1s ease-in-out",
                "@keyframes slideIn": {
                  "0%": { transform: "translateX(100%)", opacity: 0 },
                  "100%": { transform: "translateX(0)", opacity: 1 },
                },
                position: "fixed", // Added position sticky
                top: 8, // Optional: to specify the sticky position
                zIndex: 10000, // Optional: to ensure it stays above other elements
                maxWidth: "30%",
                right: 8,
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
            position={"absolute"}
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
          {/* {!isTokenAvailable ? (
            <Typography>
              You can{" "}
              <Typography
                component="a"
                color="primary"
                href="https://myaccount.google.com/permissions"
                target="_blank"
                sx={{ textDecoration: "underline" }}
              >
                Revoke This App Access
              </Typography>{" "}
              if you don't want to use this app anymore!
            </Typography>
          ) : null} */}

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
                !isTokenAvailable ? handleLoginOauthInstagram() : handleLogout();
              }}
              disabled={loginLoading || loading}
            >
              {!isTokenAvailable ? "Instagram" : "Log Out"}
            </Button>
          </Box>
          <Box display={"flex"} flexDirection="column" gap={1.5}>
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
            {isTokenAvailable ? (
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={1.5}
              >
                {!!logList.length ? (
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
                ) : null}
                <Button
                  variant="contained"
                  color={detectedCommentList.length > 0 ? "warning" : "success"}
                  startIcon={
                    detectedCommentList.length > 0 ? (
                      <KatanaIcon width={20} height={20} />
                    ) : (
                      <RemoveRedEye width={20} height={20} />
                    )
                  }
                  disabled={loading}
                  onClick={() => {
                    detectedCommentList.length > 0
                      ? handleDeleteJudolComments()
                      : handleDetectJudolComments();
                  }}
                  fullWidth
                >
                  {detectedCommentList.length > 0
                    ? "Confirm Delete Judol Comments"
                    : "Detect Judol Comments"}
                </Button>
              </Box>
            ) : null}
            {!!logList.length ? (
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                // alignItems={"center"}
                gap={1.5}
                flexDirection={{ xs: "column", sm: "row" }}
                sx={{ mb: 15 }}
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
                    // style the scrollbar
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
                  {logList.map((log, index) => (
                    <Typography
                      key={index}
                      variant="subtitle2"
                      sx={{
                        backgroundColor: "white",
                        borderRadius: "4px",
                        padding: "8px",
                        width: "100%",
                      }}
                    >
                      {log}
                    </Typography>
                  ))}
                </Box>
                <Box
                  display={"flex"}
                  flexDirection="column"
                  gap={1.5}
                  justifyContent={"left"}
                  alignItems={"left"}
                  sx={{
                    maxHeight: window.innerHeight - 410,
                    overflowY: "auto",
                    width: "100%",
                    px: 2,
                    pb: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "4px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    // style the scrollbar
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
                  {detectedCommentList.map((comment, index) => (
                    <Box
                      key={index}
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
                  ))}
                </Box>
              </Box>
            ) : null}
          </Box>
        </main>
        <footer className={styles.footer}>
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"row"}
            width={"100%"}
            position={{ xs: "relative", md: "absolute" }}
            sx={{
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "white" }}>
              &copy; {new Date().getFullYear()} Judol Slayer by
            </Typography>
            <Typography
              component="a"
              color="info"
              href="https://frisrsyd.github.io/Portfolio/"
              target="_blank"
              sx={{ display: "inline" }}
            >
              <Web />
              frisrsyd
            </Typography>
          </Box>
          <Box
            display={"flex"}
            justifyContent={{ xs: "center", sm: "end" }}
            alignItems={"center"}
            flexDirection={"row"}
            width={"100%"}
            pr={{ xs: 0, sm: 2 }}
          >
            <a href="https://ko-fi.com/frisrsyd">
              {" "}
              <Image
                src="/ko-fi-banner.png"
                alt="frisrsyd"
                width={250}
                height={50}
              />
            </a>
          </Box>
          {/* <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Examples
          </a>
          <a
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to nextjs.org →
          </a> */}
        </footer>
      </div>
    </>
  );
}
