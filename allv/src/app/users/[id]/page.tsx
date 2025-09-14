import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PostForm from "@/components/PostForm";
import PostsList from "@/components/PostsList";
import { createPost, updatePost, deletePost } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) return notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, body: true, createdAt: true },
  });
  const postsPlain = posts.map((p:any) => ({ ...p, createdAt: p.createdAt.toISOString() }));

  // bound server actions
  const createForUser = createPost.bind(null, user.id);
  const updateForUser = updatePost.bind(null, user.id);
  const deleteForUser = deletePost.bind(null, user.id);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>
        </Button>
      </div>

      {/* User header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{user.email}</p>
        </CardContent>
      </Card>

      {/* Create post */}
      <Card>
        <CardHeader>
          <CardTitle>Create post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm submit={createForUser} submitLabel="Publish post" />
        </CardContent>
      </Card>

      {/* Posts list */}
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <PostsList posts={postsPlain} onDelete={deleteForUser} onUpdate={updateForUser} />
        </CardContent>
      </Card>
    </div>
  );
}
