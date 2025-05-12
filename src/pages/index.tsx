import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Box, Button, TextField, Typography } from "@mui/material";
import Upload from "@/components/Upload";
import * as React from "react";
import {
  Check,
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [credentialJson, setcredentialJson] = React.useState<Record<
    string,
    any
  > | null>(null);
  const [channelId, setChannelId] = React.useState<string | null>(null);
  const [isCredentialAvailable, setIsCredentialAvailable] =
    React.useState<boolean>(true);
  const [isTokenAvailable, setIsTokenAvailable] =
    React.useState<boolean>(false);
  const [isRefreshTokenAvailable, setIsRefreshTokenAvailable] =
    React.useState<boolean>(false);
  const [isChannelIdAvailable, setIsChannelIdAvailable] =
    React.useState<boolean>(true);
  const [isLogout, setIsLogout] = React.useState<boolean>(false);
  const [logList, setLogList] = React.useState<string[]>([]);

  const onFileChange = (file: FileList | null) => {
    if (!!file?.length) {
      const selectedFile = file[0];
      console.log("File selected:", selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          console.log("JSON content:", json);
          setcredentialJson(json);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(selectedFile); // Uncommented to read the file content
      console.log("this line after read as text of json");
    }
  };

  const handleDeleteCredential = async () => {
    try {
      const response = await fetch("/api/credential/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Response from server:", data);
      checkCredentialIsValid();
    } catch (error) {
      console.error("Error deleting credential:", error);
    }
  };

  const handleSaveChannelId = async (channelId: string | null) => {
    if (channelId) {
      try {
        const response = await fetch("/api/channel-id/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ channelId }),
        });
        const data = await response.json();
        getChannelId();
        console.log("Response from server:", data);
      } catch (error) {
        console.error("Error saving channel ID:", error);
      }
    }
  };

  const setCredential = async () => {
    try {
      const response = await fetch("/api/credential/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentialJson }),
      });
      const data = await response.json();
      checkCredentialIsValid();
      console.log("Response from server:", data);
    } catch (error) {
      console.error("Error setting credential:", error);
    }
  };

  React.useEffect(() => {
    console.log("Credential JSON Changed:", credentialJson);
    if (credentialJson) {
      setCredential();
    }
  }, [credentialJson]);

  const checkCredentialIsValid = async () => {
    try {
      const response = await fetch("/api/credential/verify", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Response from server:", data);
      if (data.isValid) {
        setIsCredentialAvailable(true);
      } else {
        setIsCredentialAvailable(false);
      }
    } catch (error) {
      console.error("Error getting credential:", error);
    }
  };

  React.useEffect(() => {
    checkCredentialIsValid();
  }, []);

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

  React.useEffect(() => {
    tokenIsValid();
  }, []);

  const getChannelId = async () => {
    try {
      const response = await fetch("/api/channel-id/read", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Response from server:", data);
      setIsChannelIdAvailable(!!data.channelId);
      setChannelId(data.channelId);
    } catch (error) {
      console.error("Error getting channel ID:", error);
    }
  };

  React.useEffect(() => {
    getChannelId();
  }, []);

  const handleDeleteChannelId = async (channelId: string | null) => {
    if (channelId) {
      try {
        const response = await fetch("/api/channel-id/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("Response from server:", data);
        getChannelId();
      } catch (error) {
        console.error("Error deleting channel ID:", error);
      }
    }
  };

  const handleLoginOauthGoogle = async () => {
    try {
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
              checkCredentialIsValid();
              tokenIsValid();
            }
          } catch (error) {
            // Ignore cross-origin errors until the popup redirects to the same origin
          }
        }, 500);
      } else {
        console.log(data.message);
        checkCredentialIsValid();
        tokenIsValid();
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // const response = await fetch("/api/logout", {
      //   method: "DELETE",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });
      // const data = await response.json();
      // console.log("Response from server:", data);
      // checkCredentialIsValid();
      // tokenIsValid();
      Promise.all([
        fetch("/api/token/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/credential/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/channel-id/delete", {
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
              throw new Error("Network response was not ok");
            }
          });
          console.log("Logout successful");
          setIsLogout(true);
          // window.open("https://myaccount.google.com/permissions", "_blank");
        })
        .catch((error) => {
          console.error("Error during logout:", error);
        });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  React.useEffect(() => {
    console.log("isLogout:", isLogout);
    if (isLogout) {
      checkCredentialIsValid();
      tokenIsValid();
      getChannelId();
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
          {isRefreshTokenAvailable &&
          // &&!isCredentialAvailable
          !isTokenAvailable ? (
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
          {!isCredentialAvailable ? (
            <Upload onFileChange={onFileChange} width={"100%"} />
          ) : !isTokenAvailable ? //     variant="contained" //   <Button //   </Typography> //     Credential is already set, wanna change credential? //   <Typography variant="subtitle1"> // <Box display={"flex"} flexDirection="column" gap={1.5}>
          //     color="error"
          //     onClick={handleDeleteCredential}
          //     startIcon={<Delete />}
          //     // sx={{
          //     //   backgroundColor: "red",
          //     //   color: "white",
          //     //   "&:hover": {
          //     //     backgroundColor: "darkred",
          //     //   },
          //     // }}
          //   >
          //     Change Credential
          //   </Button>
          // </Box>
          null : null}
          {isCredentialAvailable ? (
            <Button
              variant="contained"
              color="error"
              startIcon={!isTokenAvailable ? <Google /> : <Logout />}
              onClick={() => {
                !isTokenAvailable ? handleLoginOauthGoogle() : handleLogout();
              }}
            >
              {!isTokenAvailable ? "Login With Google" : "Log Out"}
            </Button>
          ) : null}
          <Box display={"flex"} flexDirection="column" gap={1.5}>
            {/* <label htmlFor="channel-id">
              {
                <>
                  You can get your (
                  <Typography
                    component="a"
                    color="primary"
                    href="https://www.youtube.com/account_advanced"
                    target="_blank"
                    sx={{ textDecoration: "underline" }}
                  >
                    channel ID here
                  </Typography>
                  )
                </>
              }
            </label>
            <TextField
              label="Channel ID"
              id="channel-id"
              value={channelId || ""}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Enter Channel ID"
              fullWidth
              sx={{
                backgroundColor: "white",
                borderRadius: "4px",
              }}
            /> */}
            {/* <Box
              display={"flex"}
              flexDirection="row"
              gap={1.5}
              justifyContent="space-between"
              alignItems="center"
            >
              {isChannelIdAvailable ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => {
                    handleDeleteChannelId(channelId);
                  }}
                >
                  Delete Channel ID
                </Button>
              ) : null}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Save />}
                disabled={!channelId}
                onClick={() => {
                  handleSaveChannelId(channelId);
                }}
              >
                Submit Channel ID
              </Button>
            </Box> */}
            {isTokenAvailable && isCredentialAvailable ? (
              // && isChannelIdAvailable
              <Button
                variant="contained"
                color="success"
                startIcon={<Check />}
                // disabled={!channelId}
                onClick={() => {
                  handleDeleteJudolComments();
                }}
              >
                LETS SLAYER JUDOL COMMENTS
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
                  maxHeight: "50dvh",
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
          {/* {!!credentialJson && (
            <Typography variant="subtitle2">
              {JSON.stringify(credentialJson, null, 2)}
            </Typography>
          )} */}
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
