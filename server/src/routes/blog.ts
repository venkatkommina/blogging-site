import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

blogRouter.use(async (c, next) => {
  // console.log("Middleware Start");
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];
    // console.log("Token:", token);
    if (!token) {
      console.error("No token provided");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = (await verify(token, c.env.JWT_SECRET)) as { id: string };
    // console.log("Decoded User:", user);
    if (!user || !user.id) {
      console.error("Invalid user or user ID not found");
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.userId = user.id; // Assign the user ID to the context
    // console.log("User ID set in context:", c.userId);

    await next();
  } catch (error) {
    console.error("Middleware Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// blogRouter.get("/", (c) => {
//   //return/display the user id stored in the context object
//   return c.text(`Hello ${c.userId}`);
// });

blogRouter.post("/", async (c) => {
  try {
    const { title, content } = await c.req.json();

    if (!title || !content) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
        author: {
          connect: { id: c.userId }, // This connects the post to an existing user
        },
      },
    });

    return c.json(post);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

blogRouter.put("/", async (c) => {
  const { id, title, content } = await c.req.json();

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const data: { title?: string; content?: string } = {};
    if (title) data.title = title;
    if (content) data.content = content;

    // Ensure there's at least one field to update
    if (Object.keys(data).length === 0) {
      return c.json({ error: "No fields provided to update" }, 400);
    }

    const post = await prisma.post.update({
      where: { id: id, authorId: c.userId },
      data,
    });

    return c.json(post, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

blogRouter.get("/bulk", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany({});

    return c.json(posts, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

blogRouter.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    return c.json(post, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default blogRouter;
