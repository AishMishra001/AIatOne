import { Elysia, t } from "elysia";
import { TodoService } from "../services/todo.service";

export const todoController = new Elysia({ prefix: "/todos" })
  // GET all Todos
  .get("/", () => {
    return TodoService.getAll();
  })

  // GET Todo by ID
  .get("/:id", async ({ params: { id }, error }) => {
    const todo = await TodoService.getById(Number(id));
    if (!todo) {
      return error(404, { message: "Todo not found" });
    }
    return todo;
  }, {
    params: t.Object({
      id: t.Numeric(),
    })
  })

  // POST create a Todo
  .post("/", async ({ body, error }) => {
    try {
      return await TodoService.create(body);
    } catch (e) {
      return error(400, { message: "Could not create todo" });
    }
  }, {
    body: t.Object({
      title: t.String({ minLength: 1 }),
    })
  })

  // PUT update a Todo
  .put("/:id", async ({ params: { id }, body, error }) => {
    try {
      const updated = await TodoService.update(Number(id), body);
      return updated;
    } catch (e) {
      return error(404, { message: "Todo not found or update failed" });
    }
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      title: t.Optional(t.String({ minLength: 1 })),
      completed: t.Optional(t.Boolean()),
    })
  })

  // DELETE a Todo
  .delete("/:id", async ({ params: { id }, error }) => {
    try {
      await TodoService.delete(Number(id));
      return { success: true, message: `Todo ${id} deleted` };
    } catch (e) {
      return error(404, { message: "Todo not found" });
    }
  }, {
    params: t.Object({
      id: t.Numeric(),
    })
  });
