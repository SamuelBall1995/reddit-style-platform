"use server";
// using server actions to handle form submissions
// in a production setting, id use api routes instead so the API can be consumed by other clients
// but this is a demo app so server actions are fine

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { UserSchema, type UserInput } from "@/lib/validation";

export async function createUser(input: UserInput) {
  const parsed = UserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  await prisma.user.create({ data: parsed.data });
  revalidatePath("/users");  // refresh the list after mutation
  return { ok: true };
}

export async function updateUser(id: string, input: UserInput) {
  const parsed = UserSchema.safeParse(input);
    if (!parsed.success) {
        return { ok: false, errors: parsed.error.flatten().fieldErrors };
    }
    await prisma.user.update({ where: { id }, data: parsed.data });
    revalidatePath("/users");
    return { ok: true };
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
}

