import { Hono } from "hono";
import userRouter from "./routes/user";
import blogRouter from "./routes/blog";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

app.get("/", (c) => {
  return c.text("Hello World!");
});
app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
