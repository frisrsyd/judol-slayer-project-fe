import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Box, Button, TextField, Typography } from "@mui/material";
import Upload from "@/components/Upload";
import * as React from "react";
import { Delete, Google, Save } from "@mui/icons-material";
import { google } from "googleapis";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
    React.useState<boolean>(false);

  const onFileChange = (file: FileList | null) => {
    if (file) {
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
    if (credentialJson) {
      setCredential();
    }
  }, [JSON.stringify(credentialJson)]);

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

  return (
    <>
      <Head>
        <title>Judol Slayer</title>
        <meta
          name="description"
          content="Judol Slayer UI Project improvement"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <SpeedInsights />
        <main className={styles.main}>
          {/* <Typography variant="h3">Judol Slayer Main Content</Typography> */}
          {!isCredentialAvailable ? (
            <Upload onFileChange={onFileChange} />
          ) : (
            <Box display={"flex"} flexDirection="column" gap={1.5}>
              <Typography variant="subtitle1">
                Credential is already set, wanna change credential?
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteCredential}
                startIcon={<Delete />}
                // sx={{
                //   backgroundColor: "red",
                //   color: "white",
                //   "&:hover": {
                //     backgroundColor: "darkred",
                //   },
                // }}
              >
                Change Credential
              </Button>
            </Box>
          )}
          {isCredentialAvailable ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<Google />}
              onClick={() => {
                // handleLoginOauthGoogle();
              }}
            >
              Login With Google
            </Button>
          ) : null}
          <Box display={"flex"} flexDirection="column" gap={1.5}>
            <label htmlFor="channel-id">
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
            />
            <Box
              display={"flex"}
              flexDirection="row"
              gap={1.5}
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  handleDeleteChannelId(channelId);
                }}
              >
                Delete Channel ID
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={() => {
                  handleSaveChannelId(channelId);
                }}
              >
                Submit Channel ID
              </Button>
            </Box>
          </Box>
          {!!credentialJson && (
            <Typography variant="subtitle2">
              {JSON.stringify(credentialJson, null, 2)}
            </Typography>
          )}
        </main>
        {/* <footer className={styles.footer}>
          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Learn
          </a>
          <a
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
          </a>
        </footer> */}
      </div>
    </>
  );
}
