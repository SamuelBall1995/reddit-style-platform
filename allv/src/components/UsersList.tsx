"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type User = { id: string; name: string; email: string; createdAt: string; postsCount: number; };

export default function UsersList({
  users,
  onDelete,
}: {
  users: User[];
  onDelete: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <ul className="divide-y rounded border bg-white">
      {users.map((u) => (
        <li key={u.id} className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {/* Keep name clickable */}
            <Link
              href={`/users/${u.id}`}
              className="font-medium hover:underline block truncate"
            >
              {u.name}
            </Link>
            <p className="text-sm text-muted-foreground truncate">{u.email}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary">{u.postsCount} posts</Badge>
            {/* New explicit View button */}
            <Button asChild variant="secondary" size="sm">
              <Link href={`/users/${u.id}`}>View</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => startTransition(() => onDelete(u.id))}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
