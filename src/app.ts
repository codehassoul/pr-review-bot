import Fastify from "fastify";
import githubWebhookRoutes from "./routes/githubWebhook.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Capture raw body for GitHub webhook signature verification
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    function (_req, body, done) {
      done(null, body);
    }
  );

  // Attach rawBody manually
  app.addHook("preHandler", (request, _reply, done) => {
    if (request.body && Buffer.isBuffer(request.body)) {
      (request as any).rawBody = request.body;
    }
    done();
  });

  // Register routes
  app.register(githubWebhookRoutes, {
    prefix: "/webhook",
  });

  // Health check
  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}