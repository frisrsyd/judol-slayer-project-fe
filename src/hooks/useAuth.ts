import * as React from "react";
import { AlertProps } from "./useAlert";

export interface UseAuthProps {
  platform: "youtube" | "instagram" | "main";
  setAlert: (alert: AlertProps) => void;
}

export function useAuth({ platform, setAlert }: UseAuthProps) {
  const [isTokenAvailable, setIsTokenAvailable] =
    React.useState<boolean>(false);
  const [isRefreshTokenAvailable, setIsRefreshTokenAvailable] =
    React.useState<boolean>(false);
  const [isLogout, setIsLogout] = React.useState<boolean>(false);
  const [loginLoading, setLoginLoading] = React.useState<boolean>(false);

  const env = process.env.NODE_ENV;

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
          : ["/api/token/delete", "/api/google-oauth-revoke"];

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

  // OAuth redirect handling effect
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

  return {
    // State
    isTokenAvailable,
    isRefreshTokenAvailable,
    isLogout,
    loginLoading,

    // Functions
    tokenIsValid,
    handleLogin,
    handleLogout,

    // Setters
    setIsTokenAvailable,
    setLoginLoading,
    setIsLogout,
  };
}
