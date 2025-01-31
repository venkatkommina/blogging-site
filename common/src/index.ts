import zod from "zod";

export const signUpInput = zod.object({
  email: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string().optional(),
  password: zod.string().min(8),
});

export const signInInput = zod.object({
  email: zod.string().email(),
  password: zod.string().min(8),
});

export const postInput = zod.object({
  title: zod.string(),
  content: zod.string(),
  published: zod.boolean().default(false),
});

export const updatePostInput = zod.object({
  id: zod.string(),
  title: zod.string().optional(),
  content: zod.string().optional(),
});

export type SignUpInput = zod.infer<typeof signUpInput>;
export type SignInInput = zod.infer<typeof signInInput>;
export type PostInput = zod.infer<typeof postInput>;
export type UpdatePostInput = zod.infer<typeof updatePostInput>;
