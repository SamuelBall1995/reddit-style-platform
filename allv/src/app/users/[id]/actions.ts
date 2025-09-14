"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PostSchema, type PostInput } from "@/lib/validation";

type ActionResult = { ok: boolean; errors?: Record<string, string[]> };

// server actions for creating, updating, and deleting posts
// revalidates the relevant paths after mutations to refresh data


export async function createPost(userId: string, input: PostInput): Promise<ActionResult> {
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  await prisma.post.create({ data: { ...parsed.data, authorId: userId } });
  revalidatePath(`/users/${userId}`);
  revalidatePath(`/users`);
  return { ok: true };
}

export async function updatePost(userId: string, postId: string, input: PostInput): Promise<ActionResult> {
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  await prisma.post.update({ where: { id: postId }, data: parsed.data });
  revalidatePath(`/users/${userId}`);
  revalidatePath(`/users`);
  return { ok: true };
}

export async function deletePost(userId: string, postId: string): Promise<void> {
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath(`/users/${userId}`);
  revalidatePath(`/users`);
}
