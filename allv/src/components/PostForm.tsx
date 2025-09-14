"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostSchema, type PostInput } from "@/lib/validation";
import { useTransition, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ActionResult = { ok: boolean; errors?: Record<string, string[]> };
type Props = {
  submit: (input: PostInput) => Promise<ActionResult>;
  initial?: Partial<PostInput>;
  submitLabel?: string;
  onDone?: () => void; // optional callback (e.g., close edit mode)
};

// form for creating or editing a post
// uses react-hook-form and zod for validation
// displays both client-side and server-side validation errors
// uses useTransition to show a pending state while the form is submitting
// resets the form on successful submission
// displays server-side validation errors if submission fails

export default function PostForm({ submit, initial, submitLabel = "Save", onDone }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<PostInput>({
      resolver: zodResolver(PostSchema),
      defaultValues: { title: initial?.title ?? "", body: initial?.body ?? "" },
    });

  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: PostInput) => {
    startTransition(async () => {
      const res = await submit(data);
      if (!res.ok) {
        setServerErrors(res.errors ?? null);
      } else {
        setServerErrors(null);
        reset({ title: "", body: "" });
        onDone?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Title</Label>
        <Input {...register("title")} />
        <p className="text-sm text-red-600">{errors.title?.message}</p>
        <p className="text-sm text-red-600">{serverErrors?.title?.[0]}</p>
      </div>
      <div className="space-y-1">
        <Label>Body</Label>
        <Textarea className="min-h-[120px]" {...register("body")} />
        <p className="text-sm text-red-600">{errors.body?.message}</p>
        <p className="text-sm text-red-600">{serverErrors?.body?.[0]}</p>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
