import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { todoController } from "./controllers/todo.controller";
import { authController } from "./controllers/auth.controller";
import { jobsController } from "./controllers/jobs.controller";

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
      .use(jobsController)
  )
  
  // Start server listening on port 3000
  .listen(3000);

console.log(
  `🚀 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log("Registered routes:", app.routes.map(r => `${r.method} ${r.path}`));
