"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSchema, type UserInput } from "@/lib/validation";
import { useTransition, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  createUser: (input: UserInput) => Promise<{ ok: boolean; errors?: Record<string, string[]> }>;
};

// form for creating a new user
// uses react-hook-form and zod for validation
// displays both client-side and server-side validation errors
// uses useTransition to show a pending state while the form is submitting
// resets the form on successful submission
// displays server-side validation errors if submission fails
// in a production app id use toast notifications instead of inline errors for server-side errors
// but this is a demo app so inline is fine
// also in a production app id probably use a more robust form library like formik (used in Novarum)
// but react-hook-form is fine for this demo

export default function UserForm({ createUser }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<UserInput>({ resolver: zodResolver(UserSchema) });

  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: UserInput) => {
    startTransition(async () => {
      const res = await createUser(data);
      if (!res.ok) setServerErrors(res.errors ?? null);
      else {
        setServerErrors(null);
        reset();
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input {...register("name")} />
            <p className="text-sm text-red-600">{errors.name?.message}</p>
            <p className="text-sm text-red-600">{serverErrors?.name?.[0]}</p>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input {...register("email")} />
            <p className="text-sm text-red-600">{errors.email?.message}</p>
            <p className="text-sm text-red-600">{serverErrors?.email?.[0]}</p>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Add user"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
