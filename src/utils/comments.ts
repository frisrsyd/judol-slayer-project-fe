import { getBlockedWords } from "./blocked-words";
import { getChannelId } from "./channel-id";
import { handleGoogleAuth } from "./google";
import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";

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

      if (getJudolComment(commentText as string, req)) {
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

function getJudolComment(text: string, req: any) {
  const normalizedText = text.normalize("NFKD");
  if (text !== normalizedText) {
    return true;
  }
  const fetchBlockedWords = getBlockedWords(req);
  const blockedWords: string[] =
    typeof fetchBlockedWords === "object" && !!fetchBlockedWords
      ? (fetchBlockedWords as { blockedWords: string[] }).blockedWords
      : [];

  console.log("blockedWords: ", blockedWords);
  const lowerText = text.toLowerCase();

  if (!Array.isArray(blockedWords) || blockedWords.length === 0) {
    return false;
  } else {
    return blockedWords.some((word: string) =>
      lowerText.includes(word.toLowerCase())
    );
  }
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

async function youtubeContentList(auth: any) {
  const youtube = google.youtube({ version: "v3", auth });

  try {
    const response = await youtube.channels.list({
      part: ["contentDetails"],
      // id: [youtubeChannelID], // ← use forUsername if you're passing a name
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
    return [];
  }
}

async function doDeleteJudolComment(
  req: any,
  res: any,
  logCallback: (log: string) => void
) {
  try {
    const auth = await handleGoogleAuth(req, res);
    // const fetchChannelId = getChannelId(req);
    // const channelId =
    //   typeof fetchChannelId === "object" &&
    //   !!fetchChannelId &&
    //   "channelId" in fetchChannelId
    //     ? (fetchChannelId as { channelId: string }).channelId
    //     : fetchChannelId;
    // const contentList = await youtubeContentList(auth, channelId as string);
    const contentList = await youtubeContentList(auth);

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
