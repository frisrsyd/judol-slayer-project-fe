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

  const [alertQueue, setAlertQueue] = React.useState<AlertProps[]>([]);
  const progressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, isopen: false }));
  };

  // Clear existing timers
  const clearTimers = () => {
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Show new alert function
  const showAlert = React.useCallback((newAlert: AlertProps) => {
    clearTimers();

    setAlert({
      ...newAlert,
      isopen: true,
      progress: 100,
    });
  }, []);

  // Custom setAlert function that handles queuing
  const setAlertWithQueue = React.useCallback(
    (newAlert: AlertProps) => {
      if (alert.isopen) {
        // If an alert is currently showing, close it and show new one after brief delay
        setAlert((prev) => ({ ...prev, isopen: false }));
        setTimeout(() => {
          showAlert(newAlert);
        }, 100);
      } else {
        // Show immediately if no alert is currently showing
        showAlert(newAlert);
      }
    },
    [alert.isopen, showAlert]
  );

  // Alert progress effect
  React.useEffect(() => {
    if (alert.isopen) {
      clearTimers();

      progressTimerRef.current = setTimeout(() => {
        setAlert((prev) => ({ ...prev, progress: 0 }));
      }, 10000);

      progressIntervalRef.current = setInterval(() => {
        setAlert((prev) => {
          const newProgress = (prev.progress ?? 0) - 2;
          if (newProgress <= 0) {
            clearTimers();
            return { ...prev, progress: 0, isopen: false };
          }
          return { ...prev, progress: newProgress };
        });
      }, 200);

      return clearTimers;
    }
  }, [alert.isopen]);

  // Cleanup on unmount
  React.useEffect(() => {
    return clearTimers;
  }, []);

  return {
    alert,
    setAlert: setAlertWithQueue,
    handleCloseAlert,
  };
}
