import { FastifyRequest, FastifyReply } from "fastify";
import { verifyGitHubSignature } from "../utils/verifySignature.js";
import { config } from "../config.js";
import { fetchPullRequestFiles } from "../services/githubService.js";
import { generateAIReview } from "../services/aiReviewService.js";
import { postPullRequestReview } from "../services/githubReviewService.js";

export async function handleGitHubWebhook(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const event = request.headers["x-github-event"] as string | undefined;
    const signature = request.headers["x-hub-signature-256"] as
      | string
      | undefined;

    const rawBody = (request as any).rawBody as Buffer | undefined;

    request.log.info({ event }, "GitHub webhook received");

    if (!rawBody) {
      request.log.warn("Webhook rejected: missing raw body");
      reply.code(400);
      return { error: "Missing raw body" };
    }

    const isValid = verifyGitHubSignature(
      rawBody,
      signature,
      config.github.webhookSecret,
    );

    if (!isValid) {
      request.log.warn("Webhook rejected: invalid signature");
      reply.code(401);
      return { error: "Invalid signature" };
    }

    // 🔹 CRITICAL: parse JSON from raw buffer
    const payload = JSON.parse(rawBody.toString("utf8"));
    const action = payload.action;

    request.log.info(
      {
        event,
        action,
        prNumber: payload.pull_request?.number,
      },
      "PR webhook received (raw)",
    );

    if (event !== "pull_request") {
      return { ignored: true };
    }

    const allowedActions = ["opened", "synchronize", "reopened"];
    if (!allowedActions.includes(action)) {
      request.log.info({ action }, "Pull request ignored: action not handled");
      return { ignored: true };
    }

    const repoFullName = payload.repository.full_name;
    const [owner, repo] = repoFullName.split("/");
    const prNumber = payload.pull_request.number;

    request.log.info(
      { repo: repoFullName, prNumber, action },
      "Processing pull request",
    );

    // ======================
    // Day 2: Fetch PR diff
    // ======================
    const files = await fetchPullRequestFiles(
      owner,
      repo,
      prNumber,
      config.github.token,
    );

    const changes = files.map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch ?? null,
    }));

    request.log.info(
      {
        repo: repoFullName,
        prNumber,
        filesChanged: changes.length,
      },
      "Pull request diff fetched",
    );

    // ======================
    // Day 3: AI review
    // ======================
    const aiSuggestions = await generateAIReview(changes);

    request.log.info(
      {
        repo: repoFullName,
        prNumber,
        suggestionsCount: aiSuggestions.length,
      },
      "AI review suggestions generated",
    );

    // ======================
    // Day 4: Post PR review
    // ======================
    try {
      const reviewText = aiSuggestions;
      
      await postPullRequestReview(
        owner,
        repo,
        prNumber,
        reviewText,
        config.github.token,
      );

      request.log.info(
        { repo: repoFullName, prNumber },
        "AI-assisted PR review posted",
      );
    } catch (err) {
      // IMPORTANT: do NOT fail webhook delivery
      request.log.error(
        err,
        "Failed to post AI review to GitHub (non-blocking)",
      );
    }

    return {
      ok: true,
      filesChanged: changes.length,
    };
  } catch (err) {
    request.log.error(err, "Failed to process GitHub webhook");
    reply.code(500);
    return { error: "Internal server error" };
  }
}
