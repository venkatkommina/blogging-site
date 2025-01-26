import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { hashPassword } from "../utils/hashPassword";
import { sign } from "hono/jwt";

const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.get("/", (c) => {
  return c.text("Hello User!");
});

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { email, firstName, lastName, password } = await c.req.json();

  if (!email || !firstName || !password) {
    return c.json({ error: "Missing required fields" });
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return c.json({ error: "User already exists" });
  }

  const { hashedPassword, salt } = await hashPassword(password);

  const saltAndPassword = salt + ":" + hashedPassword;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: saltAndPassword,
      },
    });

    const token = await sign(
      {
        id: user.id,
        email: user.email,
        salt,
      },
      c.env.JWT_SECRET
    );
    return c.json({ user, token });
  } catch (e) {
    console.log(e);
    return c.json({ error: "Server Error" });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { username, password } = await c.req.json();

  if (!username || !password) {
    return c.json({ error: "Username and password are required" }, 400);
  }

  try {
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: username },
    });

    if (!user) {
      return c.json({ error: "Invalid username or password" }, 401);
    }

    // Extract salt and hashed password
    const [salt, storedHashedPassword] = user.password.split(":");

    // Re-hash the input password with the stored salt
    const { hashedPassword: inputHashedPassword } = await hashPassword(
      password,
      10000, // Use the same saltRounds as during sign-up
      64, // Use the same keyLength as during sign-up
      salt // Pass the stored salt to the hashing function
    );

    // Compare the re-hashed input password with the stored hashed password
    if (storedHashedPassword !== inputHashedPassword) {
      return c.json({ error: "Invalid username or password" }, 401);
    }

    // Generate JWT
    const token = await sign({ username }, c.env.JWT_SECRET);

    return c.json({ message: "Signin successful", token });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Something went wrong" }, 500);
  }
});

export default userRouter;
