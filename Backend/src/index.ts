import { Elysia } from "elysia";
import { todoController } from "./controllers/todo.controller";

const app = new Elysia()
  // Base route for healthcheck
  .get("/", () => ({ status: "ok", message: "Bun & Elysia backend running smoothly" }))
  
  // Group all API routes under /api prefix
  .group("/api", (app) => app.use(todoController))
  
  // Start server listening on port 3000
  .listen(3000);

console.log(
  `🚀 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`
);
