import { FastifyInstance } from "fastify";
import { handleGitHubWebhook } from "../controllers/githubController.js";

export default async function githubWebhookRoutes(
  app: FastifyInstance
) {
  app.post(
    "/github",
    {
      config: {
        rawBody: true,
      },
    },
    handleGitHubWebhook
  );
}