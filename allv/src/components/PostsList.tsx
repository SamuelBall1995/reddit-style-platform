"use client";

import { useState, useTransition } from "react";
import PostForm from "./PostForm";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

type Post = { id: string; title: string; body: string; createdAt: string };

// displays a list of posts with edit and delete buttons
// allows inline editing of posts using PostForm
// uses useTransition to show a pending state while a delete is in progress

export default function PostsList({
  posts,
  onDelete,
  onUpdate,
}: {
  posts: Post[];
  onDelete: (postId: string) => Promise<void>;
  onUpdate: (postId: string, input: { title: string; body: string }) => Promise<{ ok: boolean; errors?: Record<string, string[]> }>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (posts.length === 0) {
    return <p className="text-sm text-gray-600">No posts yet.</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <Card key={p.id}>
          {editingId === p.id ? (
            <CardContent className="pt-6">
              <PostForm
                initial={{ title: p.title, body: p.body }}
                submit={(input) => onUpdate(p.id, input)}
                submitLabel="Update"
                onDone={() => setEditingId(null)}
              />
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{p.body}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditingId(p.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => startTransition(() => onDelete(p.id))}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  {isPending ? "Deleting…" : "Delete"}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
