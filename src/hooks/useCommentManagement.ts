import * as React from "react";
import { AlertProps } from "./useAlert";

export interface LogEntry {
  [key: string]: any;
  time?: number;
}

export interface Comment {
  commentId: string;
  commentText: string;
  mustBeDelete: boolean;
  time?: number;
}

export interface UseCommentManagementProps {
  platform: "youtube" | "instagram" | "main";
  setAlert: (alert: AlertProps) => void;
}

export function useCommentManagement({
  platform,
  setAlert,
}: UseCommentManagementProps) {
  const [logList, setLogList] = React.useState<LogEntry[]>([]);
  const [detectedCommentList, setDetectedCommentList] = React.useState<
    Comment[]
  >([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const env = process.env.NODE_ENV;

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
      const time = event.timeStamp;
      if (data.log) {
        const logEntry: LogEntry =
          typeof data.log === "string"
            ? { log: data.log, time }
            : { ...data.log, time };
        setLogList((prevLogs) => [...prevLogs, logEntry]);
      }
      if (data.detectedComment) {
        setDetectedCommentList((prevComments) => [
          ...prevComments,
          { ...data.detectedComment, time },
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
        if (data.log) {
          const time = Date.now(); // Use current timestamp for deletion logs
          const logEntry: LogEntry =
            typeof data.log === "string"
              ? { log: data.log, time }
              : { ...data.log, time };
          setLogList((prev) => [...prev, logEntry]);
        }
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

  // Effects for logging
  React.useEffect(() => {
    if (!!logList.length) {
      setLoading(false);
    }
  }, [logList]);

  React.useEffect(() => {
    env !== "production" &&
      console.log("Comments to delete:", detectedCommentList);
  }, [detectedCommentList]);

  return {
    // State
    logList,
    detectedCommentList,
    loading,

    // Functions
    handleDetectJudolComments,
    handleCommentCheckboxChange,
    handleDeleteJudolComments,
    handleDownloadLogFile,

    // Setters
    setLogList,
    setDetectedCommentList,
    setLoading,
  };
}
