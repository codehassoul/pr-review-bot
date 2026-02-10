import fetch from "node-fetch";

const GITHUB_API_BASE = "https://api.github.com";

export type GitHubPRFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
};

export async function fetchPullRequestFiles(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
): Promise<GitHubPRFile[]> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/files`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "pr-review-bot",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `GitHub API error ${response.status}: ${text}`,
    );
  }

  // ✅ node-fetch way: parse JSON explicitly
  const data = (await response.json()) as GitHubPRFile[];

  return data;
}
