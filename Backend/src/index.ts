import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { todoController } from "./controllers/todo.controller";
import { authController } from "./controllers/auth.controller";
import { leaderboardController } from "./controllers/leaderboard.controller";
import { jobsController } from "./controllers/jobs.controller";
import { newsController } from "./controllers/news.controller";
import { resourcesController } from "./controllers/resources.controller";


const app = new Elysia()
  // Enable CORS for client-side API requests
  .use(cors())

  // Base route for healthcheck
  .get("/", () => ({ status: "ok", message: "Bun & Elysia backend running smoothly" }))

  // Group all API routes under /api prefix
  .group("/api", (app) =>
    app
      .use(todoController)
      .use(authController)
      .use(leaderboardController)
      .use(jobsController)
      .use(newsController)
      .use(resourcesController)
  )

  // Start server listening on port 3000
  .listen(3000);

console.log(
  `🚀 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log("Registered routes:", app.routes.map(r => `${r.method} ${r.path}`));
