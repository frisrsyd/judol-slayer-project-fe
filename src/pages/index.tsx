import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  TextField,
  Typography,
} from "@mui/material";
import Upload from "@/components/Upload";
import * as React from "react";
import {
  Check,
  CheckBox,
  Delete,
  GitHub,
  Google,
  Logout,
  Save,
  Web,
} from "@mui/icons-material";
import { google } from "googleapis";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { get } from "http";
import Image from "next/image";
import { KatanaIcon } from "../../public/katana";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [blockedWords, setBlockedWords] = React.useState<string[]>([]);
  const [isTokenAvailable, setIsTokenAvailable] =
    React.useState<boolean>(false);
  const [isRefreshTokenAvailable, setIsRefreshTokenAvailable] =
    React.useState<boolean>(false);
  const [isLogout, setIsLogout] = React.useState<boolean>(false);
  const [logList, setLogList] = React.useState<string[]>([]);
  const [loginLoading, setLoginLoading] = React.useState<boolean>(false);

  const tokenIsValid = async () => {
    try {
      const response = await fetch("/api/token/verify", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Response from server:", data);
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
      console.error("Error getting token:", error);
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
      console.log("Response from server:", data);
      console.log("Blocked words:", data.blockedWords);
      setBlockedWords(data.blockedWords);
    } catch (error) {
      console.error("Error getting blockedWords:", error);
    }
  };

  React.useEffect(() => {
    getBlockedWords();
  }, []);

  const handleLoginOauthGoogle = async () => {
    try {
      setLoginLoading(true);
      // Step 1: Get the Google OAuth URL
      const response = await fetch("/api/google-oauth", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      // console.log("Response from BE:", data);

      if (data?.url) {
        // Step 2: Redirect the user to the OAuth URL
        console.log("OAuth URL:", data.url);
        const popup = window.open(data.url, "_blank", "width=600,height=600");

        // Step 3: Listen for the authorization code
        const interval = setInterval(async () => {
          try {
            if (popup?.closed) {
              clearInterval(interval);
              console.error(
                "Popup closed before completing the login process."
              );
              // setLoginLoading(false);
              return;
            }

            const urlParams = new URLSearchParams(popup?.location.search);
            const code = urlParams.get("code");

            if (code) {
              clearInterval(interval);
              popup?.close();
              
              // Step 4: Send the authorization code to the API
              const tokenResponse = await fetch("/api/google-oauth", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
              });
              
              const tokenData = await tokenResponse.json();
              console.log("Token response from server:", tokenData);
              tokenIsValid();
              // setLoginLoading(false);
            }
          } catch (error) {
            setLoginLoading(false);
            console.error("Error during login process:", error);
            // Ignore cross-origin errors until the popup redirects to the same origin
          }
        }, 500);
      } else {
        console.log(data.message);
        tokenIsValid();
        // setLoginLoading(false);
      }
    } catch (error) {
      setLoginLoading(false);
      console.error("Error logging in with Google:", error);
    }
  };

  const handleLogout = async () => {
    try {
      setLoginLoading(true);
      Promise.all([
        fetch("/api/token/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/google-oauth-revoke", {
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
          console.log("Logout successful");
          setIsLogout(true);
          setLoginLoading(false);
          // window.open("https://myaccount.google.com/permissions", "_blank");
        })
        .catch((error) => {
          setLoginLoading(false);
          console.error("Error during logout:", error);
        });
    } catch (error) {
      setLoginLoading(false);
      console.error("Error logging out:", error);
    }
  };

  React.useEffect(() => {
    console.log("isLogout:", isLogout);
    if (isLogout) {
      tokenIsValid();
      setIsLogout(false);
      setLogList([]);
    }
  }, [isLogout]);

  const handleDeleteJudolComments = async () => {
    setLogList([]);
    // const eventSource = new EventSource("/api/do-delete-judol-comments-new");
    const eventSource = new EventSource("/api/do-delete-judol-comments");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogList((prevLogs) => [...prevLogs, data.log]);
    };

    eventSource.onerror = (error) => {
      // console.error("Error with SSE:", error);
      // setLogList((prevLogs) => [...prevLogs, "❌ An error occurred."]);
      eventSource.close();
    };

    eventSource.onopen = () => {
      console.log("SSE connection opened.");
    };
  };

  const onBlockedWordsChange = async (updatedWords: string[]) => {
    console.log("Blocked words changed:", updatedWords);
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
      console.log("Response from server:", data);
    } catch (error) {
      console.error("Error saving blocked words:", error);
    }
  };

  React.useEffect(() => {
    tokenIsValid();
    getBlockedWords();
  }, [logList]);

  return (
    <>
      <Head>
        <title>Judol Slayer</title>
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
          <Typography textAlign={"center"} variant="h4">
            Judol Slayer Project
          </Typography>
          {isRefreshTokenAvailable && !isTokenAvailable ? (
            <Typography>
              Please{" "}
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
          ) : null}

          <Button
            variant="contained"
            color="error"
            startIcon={!isTokenAvailable ? <Google /> : <Logout />}
            onClick={() => {
              !isTokenAvailable ? handleLoginOauthGoogle() : handleLogout();
            }}
            disabled={loginLoading}
          >
            {!isTokenAvailable ? "Login With Google" : "Log Out"}
          </Button>
          <Box display={"flex"} flexDirection="column" gap={1.5}>
            <Autocomplete
              fullWidth
              disablePortal
              id="blocked-words"
              options={[]}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Blocked Words"
                  placeholder="Enter Blocked Words"
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
              <Button
                variant="contained"
                color="success"
                startIcon={<KatanaIcon width={20} height={20} />}
                onClick={() => {
                  handleDeleteJudolComments();
                }}
              >
                LETS SLAY JUDOL COMMENTS
              </Button>
            ) : null}
            {!!logList.length ? (
              <Box
                display={"flex"}
                flexDirection="column"
                gap={1.5}
                justifyContent={"left"}
                alignItems={"left"}
                sx={{
                  maxHeight: `calc(50dvh - 32px)`,
                  overflowY: "auto",
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "4px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
            ) : null}
          </Box>
        </main>
        <footer className={styles.footer}>
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
          <Typography
            sx={{ color: "white" }}
            // component="a"
            // color="primary"
            // href="https://frisrsyd.github.io/Portfolio/"
            // target="_blank"
            // sx={{ textDecoration: "underline", display: "inline" }}
          >
            and
          </Typography>
          <Typography
            component="a"
            color="info"
            href="https://github.com/MBenedictt"
            target="_blank"
            sx={{ display: "inline" }}
          >
            <GitHub />
            MBenedictt
          </Typography>
          <Typography
            // component="a"
            // color="primary"
            // href="https://frisrsyd.github.io/Portfolio/"
            // target="_blank"
            // sx={{ textDecoration: "underline", display: "inline" }}
            sx={{ color: "white" }}
          >
            for base algothims
          </Typography>
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
