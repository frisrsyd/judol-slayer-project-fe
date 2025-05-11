import { getBlockedWords } from "./blocked-words";
import { getChannelId } from "./channel-id";
import { handleGoogleAuth } from "./google";
import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";

async function fetchComments(req: any, auth: any, VIDEO_ID: any) {
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

      console.log(`Checking comment: "${commentText}"`);

      if (getJudolComment(commentText as string, req)) {
        console.log(`🚨 Spam detected: "${commentText}"`);
        spamComments.push(commentId);
      }
    });

    return spamComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

function getJudolComment(text: string, req: any) {
  const normalizedText = text.normalize("NFKD");
  if (text !== normalizedText) {
    return true;
  }
  const fetchBlockedWords = getBlockedWords(req);
  const blockedWords = fetchBlockedWords.blokedWords as string[];

  const lowerText = text.toLowerCase();

  if (blockedWords.length === 0) {
    return false;
  } else {
    return blockedWords.some((word: string) =>
      lowerText.includes(word.toLowerCase())
    );
  }
}

// Delete comments
async function deleteComments(auth: any, commentIds: any) {
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
      console.log(
        `Progress: ${totalDeletedComments}/${totalCommentsToBeDeleted} (${commentIds.length} remaining)\n Deleted the following comment IDs:`,
        commentIdsChunk
      );
    } catch (error) {
      console.error(
        `Failed to delete these comment IDs: ${commentIdsChunk}:`,
        (error as Error).message
      );
    }
  } while (commentIds.length > 0);
}

async function youtubeContentList(auth: any, youtubeChannelID: string) {
  const youtube = google.youtube({ version: "v3", auth });

  try {
    const response = await youtube.channels.list({
      part: ["contentDetails"],
      id: youtubeChannelID, // ← use forUsername if you're passing a name
    });

    const channel = response.data.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    const allVideos = [];
    let nextPageToken = "";

    do {
      const playlistResponse = await youtube.playlistItems.list({
        part: "snippet",
        playlistId: uploadsPlaylistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      allVideos.push(...playlistResponse.data.items);
      nextPageToken = playlistResponse.data.nextPageToken;
    } while (nextPageToken);
    return allVideos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

async function doDeleteJudolComment(req: any, res: any) {
    const logs: string[] = [];
    try {
        const auth = await handleGoogleAuth(req, res);
        const fetchChannelId = getChannelId(req);
        const channelId = fetchChannelId.channelId;
        const contentList = await youtubeContentList(auth, channelId);

        for (const video of contentList) {
            const title = video.snippet.title;
            const videoId = video.snippet.resourceId.videoId;
            const logMessage = `\n📹 Checking video: ${title} (ID: ${videoId})`;
            console.log(logMessage);
            logs.push(logMessage);

            const spamComments = await fetchComments(req, auth, videoId);

            if (spamComments.length > 0) {
                const spamLog = `🚫 Found ${spamComments.length} spam comments. Deleting...`;
                console.log(spamLog);
                logs.push(spamLog);

                await deleteComments(auth, spamComments);

                const deleteLog = "✅ Spam comments deleted.";
                console.log(deleteLog);
                logs.push(deleteLog);
            } else {
                const noSpamLog = "✅ No spam comments found.";
                console.log(noSpamLog);
                logs.push(noSpamLog);
            }
        }

        // Write logs to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const logFileName = `${channelId}-${timestamp}.log`;
        const logFilePath = path.join(__dirname, "logs", logFileName);

        // Ensure the logs directory exists
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

        fs.writeFileSync(logFilePath, logs.join("\n"), "utf-8");
        console.log(`Logs written to ${logFilePath}`);
    } catch (error) {
        const errorLog = `Error running script: ${(error as Error).message}`;
        console.error(errorLog);
        logs.push(errorLog);

        // Write logs to file even if there's an error
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const logFileName = `error-${timestamp}.log`;
        const logFilePath = path.join(__dirname, "logs", logFileName);

        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

        fs.writeFileSync(logFilePath, logs.join("\n"), "utf-8");
        console.log(`Error logs written to ${logFilePath}`);
    }
}

export { doDeleteJudolComment };
