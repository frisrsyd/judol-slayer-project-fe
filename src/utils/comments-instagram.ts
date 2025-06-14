import { getBlockedWords } from "./blocked-words";
import { handleGoogleAuth } from "./google";
import { google } from "googleapis";
import * as fuzz from "fuzzball";
import { deleteToken, getToken } from "./token-instagram";

const instagramApiBaseUrl = process.env.NEXT_PUBLIC_INSTAGRAM_API;

function normalizeText(text: string): string {
  return text
    .normalize("NFKD") // normalize special unicode characters
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-zA-Z0-9]/g, "") // remove non-alphanum
    .toLowerCase();
}

async function fetchComments(
  req: any,
  MEDIA_ID: any,
  logs: string[],
  logCallback: (log: string) => void
) {
  try {
    const getCommentBaseUrl = `${instagramApiBaseUrl}/${MEDIA_ID}/comments?fields=id,text`;
    const response = await fetch(getCommentBaseUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken(req).access_token}`,
      },
    });

    const spamComments: Array<any> = [];
    const responseData = await response.json();

    console.log("Fetched comments:", responseData);

    responseData.data?.forEach((item: any) => {
      const commentText = item?.text;
      const commentId = item.id;

      const checkLog = `Checking comment: "${commentText}"`;
      console.log(checkLog);
      logs.push(checkLog);
      logCallback(checkLog); // Send log in real-time

      if (
        commentId &&
        typeof commentId === "string" &&
        commentText &&
        typeof commentText === "string" &&
        getJudolComment(commentText, req, logCallback)
      ) {
        const spamLog = `🚨 Spam detected: "${commentText}"`;
        console.log(spamLog);
        logs.push(spamLog);
        logCallback(spamLog); // Send log in real-time
        spamComments.push({ commentId, commentText });
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

  const basicNormalizedText = text.normalize("NFKD");
  if (text !== basicNormalizedText) {
    return true;
  }

  const fetchBlockedWords = getBlockedWords(req);
  const blockedWords: string[] =
    typeof fetchBlockedWords === "object" && !!fetchBlockedWords
      ? (fetchBlockedWords as { blockedWords: string[] }).blockedWords
      : [];

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
    const checkingSimilarityLogs = `[🔎] Checking "${normalizedText}" vs "${normalizedWord}" → ${similarity}%`;
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
  res: any,
  req: any,
  commentIds: any,
  logCallback: (log: string) => void
) {
  const totalCommentsToBeDeleted = commentIds.length;
  let totalDeletedComments = 0;
  const token = getToken(req).access_token;
  const deleteCommentBaseUrl = `${instagramApiBaseUrl}`;
  // Instagram API does not support bulk deletion, so delete one by one
  for (const commentId of commentIds) {
    try {
      const response = await fetch(`${deleteCommentBaseUrl}/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        totalDeletedComments += 1;
        const progressLog = `Progress: ${totalDeletedComments}/${totalCommentsToBeDeleted} (${
          commentIds.length - totalDeletedComments
        } remaining)\n`;
        const deletedIdsLog = `Deleted the following comment ID: ${commentId}`;
        console.log(progressLog);
        logCallback(progressLog); // Send progress log in real-time
        console.log(deletedIdsLog);
        logCallback(deletedIdsLog); // Send deleted IDs log in real-time
      }
    } catch (error) {
      if (
        (error as any)?.response?.data?.error === "invalid_grant" ||
        (error as any)?.response?.data?.error?.includes(
          "No refresh token is set"
        )
      ) {
        console.error("Invalid token. Deleting token...");
        deleteToken(res);
        throw new Error("Invalid token. Please re-authenticate.");
      }
      const errorLog = `Failed to delete this comment ID: ${commentId}: ${
        (error as Error).message
      }`;
      console.error(errorLog);
      logCallback(errorLog); // Send error log in real-time
    }
  }
}

async function instagramContentList(res: any, req: any) {
  const getMediaUrl = `${instagramApiBaseUrl}/me/media?fields=id,permalink`;
  const { access_token } = getToken((req = req));

  try {
    if (!access_token) {
      throw new Error("Access token is required to fetch Instagram content.");
    }

    // Collect all Instagram media IDs, handling pagination
    const allVideos = [];
    let nextPageToken = "";
    let hasNext = true;
    let nextPageUrl = getMediaUrl;
    do {
      const response = await fetch(nextPageUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const data = await response.json();
      console.log("Fetched data:", data);
      if (Array.isArray(data.data)) {
        allVideos.push(...data.data.map((item: any) => item));
      }
      if (data.paging && data.paging.next && data.paging.cursors?.after) {
        nextPageToken = data.paging.cursors.after;
        nextPageUrl = getMediaUrl + `&after=${nextPageToken}`;
        hasNext = true;
      } else {
        hasNext = false;
      }
    } while (hasNext);

    return allVideos;
  } catch (error) {
    console.error(
      "if you see 'invalid_grant' or 'No refresh token is set', please login again using login Button above ⬆️⬆️⬆️"
    );
    console.error("Error fetching videos:", error);
    if (
      (error as any)?.response?.data?.error === "invalid_grant" ||
      (error as any)?.response?.data?.error?.includes(
        "No refresh token is set."
      )
    ) {
      console.error("Invalid token. Deleting token...");
      deleteToken(res);
      throw new Error("Invalid token. Please re-authenticate.");
    }
    deleteToken(res);
    throw new Error("Error fetching videos: " + (error as Error).message);
  }
}

async function doDetectJudolComment(
  req: any,
  res: any,
  logCallback: (log: string) => void,
  commentCallback: (comment: {
    commentId: string;
    commentText: string;
    id: string;
    videoTitle: string;
    mustBeDelete: boolean;
  }) => void
) {
  try {
    const contentList = await instagramContentList(res, req);
    console.log(" Content List: ", contentList);

    for (const content of contentList) {
      const permalink = content?.permalink;
      const id = content.id;
      const logMessage = `\n📹 Checking content: ${permalink} (ID: ${id})`;
      console.log(logMessage);
      logCallback(logMessage); // Send log in real-time

      const spamComments = await fetchComments(req, id, [], logCallback);

      if (spamComments.length > 0) {
        const spamLog = `🚫 Found ${spamComments.length} spam comments.`;
        console.log(spamLog);
        logCallback(spamLog); // Send log in real-time

        // await deleteComments(auth, spamComments, logCallback);
        for (const spam of spamComments) {
          commentCallback({
            commentId: spam.commentId,
            commentText: spam.commentText,
            id: id ?? "",
            videoTitle: permalink ?? "",
            mustBeDelete: true,
          });
        }

        const deleteLog = "✅ Spam comments detected.";
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

async function doDeleteJudolComment(
  req: any,
  res: any,
  logCallback: (log: string) => void
) {
  try {
    const { commentIds } = req.body;
    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      throw new Error("No comment IDs provided for deletion.");
    }

    await deleteComments(res, req, [...commentIds], logCallback);

    logCallback(`✅ Selected comments deleted successfully.`);
    return { success: true };
  } catch (error) {
    const errorLog = `Error deleting comments: ${(error as Error).message}`;
    console.error(errorLog);
    logCallback(errorLog);
    throw error;
  }
}

export { doDetectJudolComment, doDeleteJudolComment };
