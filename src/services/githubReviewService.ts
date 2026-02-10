import fetch from "node-fetch";

const GITHUB_API_BASE = "https://api.github.com";

export async function postPullRequestReview(
  owner: string,
  repo: string,
  prNumber: number,
  reviewText: string,
  token: string,
) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`;

  const body = {
    body: `🤖 **AI-assisted review**\n\n${reviewText}`,
    event: "COMMENT",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "pr-review-bot",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to create PR review (${response.status}): ${text}`,
    );
  }

  return response.json();
}