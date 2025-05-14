import { getBlockedWords } from "./blocked-words";
import { handleGoogleAuth } from "./google";
import { google } from "googleapis";
import * as fuzz from "fuzzball";
import { deleteToken } from "./token";

function normalizeText(text: string): string {
  return text
    .normalize("NFKD") // normalize special unicode characters
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-zA-Z0-9]/g, "") // remove non-alphanum
    .toLowerCase();
}

async function fetchComments(
  req: any,
  auth: any,
  VIDEO_ID: any,
  logs: string[],
  logCallback: (log: string) => void
) {
  const youtube = google.youtube({ version: "v3", auth });

  try {
    const response = await youtube.commentThreads.list({
      part: ["snippet"],
      videoId: VIDEO_ID,
      maxResults: 100,
    });

    const spamComments: Array<any> = [];

    response.data.items?.forEach((item) => {
      const comment = item?.snippet?.topLevelComment?.snippet;
      const commentText = comment?.textDisplay;
      const commentId = item.id;

      const checkLog = `Checking comment: "${commentText}"`;
      console.log(checkLog);
      logs.push(checkLog);
      logCallback(checkLog); // Send log in real-time

      if (getJudolComment(commentText as string, req, logCallback)) {
        const spamLog = `🚨 Spam detected: "${commentText}"`;
        console.log(spamLog);
        logs.push(spamLog);
        logCallback(spamLog); // Send log in real-time
        spamComments.push(commentId);
      }
    });

    return spamComments;
  } catch (error) {
    const errorLog = `Error fetching comments: ${(error as Error).message}`;
    console.error(errorLog);
    logCallback(errorLog); // Send error log in real-time
    return [];
  }
}

function getJudolComment(
  text: string,
  req: any,
  logCallback: (log: string) => void
) {
  const normalizedText = normalizeText(text);

  // if (text !== normalizedText) {
  //   return true;
  // }

  const fetchBlockedWords = getBlockedWords(req);
  const blockedWords: string[] =
    typeof fetchBlockedWords === "object" && !!fetchBlockedWords
      ? (fetchBlockedWords as { blockedWords: string[] }).blockedWords
      : [];

  if (!Array.isArray(blockedWords) || blockedWords.length === 0) {
    const basicNormalizedText = text.normalize("NFKD");
    if (text !== basicNormalizedText) {
      return true;
    }
    return false;
  }

  for (const word of blockedWords) {
    const normalizedWord = normalizeText(word);
    console.log("normalizedWord: ", normalizedWord);

    // Direct substring match
    if (normalizedText.includes(normalizedWord)) {
      console.log(
        `Direct match found: "${normalizedText}" contains "${normalizedWord}"`
      );
      return true;
    }

    // Fuzzy match using fuzzball
    const similarity = fuzz.ratio(normalizedText, normalizedWord);
    const checkingSimilarityLogs = `[🔎] Checking "${normalizedText}" vs "${normalizedWord}" → ${similarity}`;
    console.log(checkingSimilarityLogs);
    logCallback(checkingSimilarityLogs); // Send log in real-time
    if (similarity >= 75) {
      return true;
    }
  }

  return false;

  // const normalizedText = text.normalize("NFKD");
  // if (text !== normalizedText) {
  //   return true;
  // }
  // const fetchBlockedWords = getBlockedWords(req);
  // const blockedWords: string[] =
  //   typeof fetchBlockedWords === "object" && !!fetchBlockedWords
  //     ? (fetchBlockedWords as { blockedWords: string[] }).blockedWords
  //     : [];

  // console.log("blockedWords: ", blockedWords);
  // const lowerText = text.toLowerCase();

  // if (!Array.isArray(blockedWords) || blockedWords.length === 0) {
  //   return false;
  // } else {
  //   return blockedWords.some((word: string) =>
  //     lowerText.includes(word.toLowerCase())
  //   );
  // }
}

// Delete comments
async function deleteComments(
  auth: any,
  commentIds: any,
  logCallback: (log: string) => void
) {
  const youtube = google.youtube({ version: "v3", auth });

  const totalCommentsToBeDeleted = commentIds.length;
  let totalDeletedComments = 0;
  do {
    const commentIdsChunk = commentIds.splice(0, 50);
    if (commentIdsChunk.length === 0) break;
    try {
      await youtube.comments.setModerationStatus({
        id: commentIdsChunk,
        moderationStatus: "rejected",
      });
      totalDeletedComments += commentIdsChunk.length;
      const progressLog = `Progress: ${totalDeletedComments}/${totalCommentsToBeDeleted} (${commentIds.length} remaining)\n Deleted the following comment IDs: ${commentIdsChunk}`;
      console.log(progressLog);
      logCallback(progressLog); // Send progress log in real-time
    } catch (error) {
      const errorLog = `Failed to delete these comment IDs: ${commentIdsChunk}: ${
        (error as Error).message
      }`;
      console.error(errorLog);
      logCallback(errorLog); // Send error log in real-time
    }
  } while (commentIds.length > 0);
}

async function youtubeContentList(auth: any, res: any) {
  const youtube = google.youtube({ version: "v3", auth });

  try {
    const response = await youtube.channels.list({
      part: ["contentDetails"],
      mine: true,
    });

    const channel = response.data?.items?.[0] ?? null;
    const uploadsPlaylistId =
      channel?.contentDetails?.relatedPlaylists?.uploads;

    const allVideos = [];
    let nextPageToken = "";

    do {
      const playlistResponse = await youtube.playlistItems.list({
        part: ["snippet"],
        playlistId: uploadsPlaylistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      if (playlistResponse.data.items) {
        allVideos.push(...playlistResponse.data.items);
      }
      nextPageToken = playlistResponse.data.nextPageToken || "";
    } while (nextPageToken);
    return allVideos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    if ((error as any)?.response?.data?.error === "invalid_grant") {
      console.error("Invalid token. Deleting token...");
      deleteToken(res);
      throw new Error("Invalid token. Please re-authenticate.");
    }
    throw new Error("Error fetching videos: " + (error as Error).message);
  }
}

async function doDeleteJudolComment(
  req: any,
  res: any,
  logCallback: (log: string) => void
) {
  try {
    const auth = await handleGoogleAuth(req, res);
    const contentList = await youtubeContentList(auth, res);

    for (const video of contentList) {
      const title = video?.snippet?.title;
      const videoId = video.snippet?.resourceId?.videoId;
      const logMessage = `\n📹 Checking video: ${title} (ID: ${videoId})`;
      console.log(logMessage);
      logCallback(logMessage); // Send log in real-time

      const spamComments = await fetchComments(
        req,
        auth,
        videoId,
        [],
        logCallback
      );

      if (spamComments.length > 0) {
        const spamLog = `🚫 Found ${spamComments.length} spam comments. Deleting...`;
        console.log(spamLog);
        logCallback(spamLog); // Send log in real-time

        await deleteComments(auth, spamComments, logCallback);

        const deleteLog = "✅ Spam comments deleted.";
        console.log(deleteLog);
        logCallback(deleteLog); // Send log in real-time
      } else {
        const noSpamLog = "✅ No spam comments found.";
        console.log(noSpamLog);
        logCallback(noSpamLog); // Send log in real-time
      }
    }
  } catch (error) {
    const errorLog = `Error running script: ${(error as Error).message}`;
    console.error(errorLog);
    logCallback(errorLog); // Send error log in real-time
    throw error;
  }
}

export { doDeleteJudolComment };
