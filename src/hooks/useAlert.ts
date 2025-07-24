import * as React from "react";

export interface AlertProps {
  isopen: boolean;
  type?: "success" | "error" | "info" | "warning";
  message?: string;
  progress?: number;
}

export function useAlert() {
  const [alert, setAlert] = React.useState<AlertProps>({
    isopen: false,
    type: "info",
    message: "",
    progress: 0,
  });

  const handleCloseAlert = () => {
    setAlert({ ...alert, isopen: false });
  };

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

  return {
    alert,
    setAlert,
    handleCloseAlert,
  };
}
