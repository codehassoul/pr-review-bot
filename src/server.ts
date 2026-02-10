import { buildApp } from "./app.js";
import { config } from "./config.js";

async function start() {
  const app = buildApp();

  try {
    await app.listen({
      port: config.port,
      host: "0.0.0.0",
    });

    app.log.info(`Server listening on port ${config.port}`);
  } catch (err) {
    app.log.error(err, "Failed to start server");
    process.exit(1);
  }
}

start();