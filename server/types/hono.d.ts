import { Context } from "hono";

declare module "hono" {
  interface Context {
    userId?: string;
  }
}
