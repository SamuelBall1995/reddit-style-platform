import { z } from "zod";

// Zod schemas and types for validating user, post, and comment data

export const UserSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  email: z.string().email("Invalid email"),
});

export type UserInput = z.infer<typeof UserSchema>;

export const PostSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  body: z.string().min(1, "Content is required"),
});

export type PostInput = z.infer<typeof PostSchema>;

export const CommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
});