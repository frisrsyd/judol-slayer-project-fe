import * as React from "react";
import { Box, Button, Typography } from "@mui/material";
import { ArrowBack, Instagram, Logout, YouTube } from "@mui/icons-material";
import Link from "next/link";
import { KatanaIcon } from "../../../public/katana";
import BlurText from "../BlurText";

interface NavigationProps {
  isTokenAvailable: boolean;
  loginLoading: boolean;
  loading: boolean;
  currentPlatform: "youtube" | "instagram" | "main";
  handleLogin?: () => void;
  handleLogout?: () => void;
}

export default function Navigation({
  isTokenAvailable,
  loginLoading,
  loading,
  currentPlatform,
  handleLogin,
  handleLogout,
}: NavigationProps) {
  return (
    <>
      {/* Header */}
      {currentPlatform !== "main" ? (
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
              (e.currentTarget as HTMLElement).style.background = "transparent";
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
      ) : null}
      {currentPlatform === "main" ? (
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
            text="Judol Slayer Project"
            delay={150}
            animateBy="words"
            direction="top"
            sx={{
              color: "#383838",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "1.5rem",
            }}
          />
          <KatanaIcon width={34} height={34} color="#383838" />
        </Box>
      ) : null}

      {/* Platform Links for Main Page */}
      {currentPlatform === "main" ? (
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          sx={{ mb: 2 }}
        >
          <Link href="/youtube" passHref>
            <Button
              variant="contained"
              color="error"
              startIcon={<YouTube />}
              sx={{
                minWidth: { xs: "100%", sm: "200px" },
                backgroundColor: "#FF0000",
                "&:hover": { backgroundColor: "#CC0000" },
              }}
            >
              YouTube Platform
            </Button>
          </Link>
          <Link href="/instagram" passHref>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Instagram />}
              sx={{
                minWidth: { xs: "100%", sm: "200px" },
                background:
                  "radial-gradient(circle farthest-corner at 120% 0%, rgb(255, 225, 125) 0%, rgb(255, 205, 105) 12%, rgb(250, 145, 55) 25%, rgb(235, 65, 65) 41%, transparent 95%), linear-gradient(-15deg, rgb(35, 75, 215) -10%, rgb(195, 60, 190) 65%)",
                // "&:hover": { backgroundColor: "#C73650" },
              }}
            >
              Instagram Platform
            </Button>
          </Link>
        </Box>
      ) : null}

      {/* Platform Indicator */}
      {currentPlatform !== "main" && (
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={1}
          sx={{ mb: 2 }}
        >
          {currentPlatform === "youtube" ? (
            <YouTube sx={{ color: "#FF0000" }} />
          ) : (
            <Instagram
              sx={{
                color: "#C73650",
              }}
            />
          )}
          <Typography
            variant="h6"
            sx={{
              color: "#383838",
              fontWeight: "bold",
              textTransform: "capitalize",
              fontSize: "24px",
            }}
          >
            {currentPlatform} Platform
          </Typography>
        </Box>
      )}

      {/* Login/Logout Info */}
      {currentPlatform !== "main" && !isTokenAvailable ? (
        <Typography sx={{ mb: 2, textAlign: "center", color: "#666" }}>
          You can{" "}
          <Typography
            component="a"
            color="primary"
            href={
              currentPlatform === "instagram"
                ? "https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Faccounts%2Fmanage_access%2F&h=AT2JdOKQYUN92sY9ekuzAldOzbsn8MetjaXjjvND9x5jTzBCfKOU1TR8IEmu1Tv_KCLrSL3I4EuSlhgk6bup3ZZ5g7KWc-hPnT57lZ63XO1dmEHujnNZfmKIldR-YSeT9acjDw"
                : "https://myaccount.google.com/permissions"
            }
            target="_blank"
            sx={{ textDecoration: "underline" }}
          >
            Revoke This App Access
          </Typography>{" "}
          from your {currentPlatform} account at any time.
        </Typography>
      ) : null}

      {/* Auth Buttons */}
      <Box
        display={"flex"}
        justifyContent={!isTokenAvailable ? "space-between" : "end"}
        alignItems={"center"}
        flexDirection={"row"}
        gap={2}
      >
        {!isTokenAvailable && handleLogin && currentPlatform !== "main" ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={
              currentPlatform === "youtube" ? (
                <YouTube />
              ) : currentPlatform === "instagram" ? (
                <Instagram />
              ) : null
            }
            onClick={handleLogin}
            disabled={loginLoading || loading}
            fullWidth
            sx={
              currentPlatform === "instagram"
                ? {
                    background:
                      "radial-gradient(circle farthest-corner at 100% 0%, rgb(255, 225, 125) 0%, rgb(255, 205, 105) 12%, rgb(250, 145, 55) 25%, rgb(235, 65, 65) 41%, transparent 95%), linear-gradient(-15deg, rgb(35, 75, 215) -10%, rgb(195, 60, 190) 65%)",
                  }
                : {}
            }
          >
            {`Login with ${
              currentPlatform === "youtube" ? "Google" : "Instagram"
            }`}
          </Button>
        ) : null}

        {isTokenAvailable && handleLogout && currentPlatform !== "main" ? (
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            disabled={loginLoading || loading}
            startIcon={<Logout />}
          >
            Logout
          </Button>
        ) : null}
      </Box>
    </>
  );
}
