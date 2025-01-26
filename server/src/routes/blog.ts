import { Hono } from "hono";

const blogRouter = new Hono();

blogRouter.get("/", (c) => {
  return c.text("Hello Blog!");
});

blogRouter.post("/", (c) => {
  return c.text("Hello Post!");
});

blogRouter.put("/", (c) => {
  return c.text("Hello Put!");
});

blogRouter.get("/:id", (c) => {
  return c.text("Hello Get!");
});

blogRouter.get("/bulk", (c) => {
  return c.text("Hello Bulk!");
});

export default blogRouter;
