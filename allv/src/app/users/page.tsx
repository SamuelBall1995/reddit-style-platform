import { prisma } from "@/lib/db";
import dynamic from "next/dynamic";
import { createUser, deleteUser } from "./actions";
import UserForm from "@/components/UserForm";
import PostsOverTimeApex from "@/components/charts/PostsOverTimeApex";
import UsersList from "@/components/UsersList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Users page that displays a list of users and a form to create new users
// uses server actions to handle form submissions and deletions
// revalidates the path after mutations to refresh the list

export default async function UsersPage() {
  const users = await prisma.user.findMany({
  orderBy: { createdAt: "desc" },
  include: {
    _count: { select: { posts: true } },
  },
});

const usersPlain = users.map((u:any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  createdAt: u.createdAt.toISOString(),
  postsCount: u._count.posts,
}));


  // Aggregate posts by day across ALL users
const rows = await prisma.$queryRaw<{ day: string | null; count: bigint | number }[]>`
  SELECT substr("createdAt", 1, 10) AS day, COUNT(*) AS count
  FROM Post
  GROUP BY day
  ORDER BY day ASC
`;

const chartData = rows
  .filter((r:any) => r.day) // drop any nulls defensively
  .map((r:any) => ({ day: r.day as string, count: Number(r.count) }));

const posts = await prisma.post.findMany({ select: { createdAt: true } });

// Count posts per day (YYYY-MM-DD)
const dayCounts = new Map<string, number>();
let minDay = Infinity, maxDay = -Infinity;

for (const p of posts) {
  const day = p.createdAt.toISOString().slice(0, 10);
  const ts = new Date(day).getTime();
  if (ts < minDay) minDay = ts;
  if (ts > maxDay) maxDay = ts;
  dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
}

// Build continuous day axis
function daysBetween(startMs: number, endMs: number) {
  if (!isFinite(startMs) || !isFinite(endMs)) return [];
  const out: string[] = [];
  for (let t = startMs; t <= endMs; t += 86_400_000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

const categories = daysBetween(minDay, maxDay);
const data = categories.map((d) => dayCounts.get(d) ?? 0);

// Safe fallbacks so the chart mounts when empty
const totalCategories = categories.length ? categories : [new Date().toISOString().slice(0, 10)];
const totalData = data.length ? data : [0];

  


  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card>
        <CardHeader><CardTitle>Posts over time (All Users)</CardTitle></CardHeader>
        <CardContent>
          <PostsOverTimeApex categories={totalCategories} data={totalData} />
        </CardContent>
      </Card>

      {/* Add user */}
      <Card>
        <CardHeader><CardTitle>Add user</CardTitle></CardHeader>
        <CardContent><UserForm createUser={createUser} /></CardContent>
      </Card>

      {/* Users list */}
      <Card>
        <CardHeader><CardTitle>All users</CardTitle></CardHeader>
        <CardContent>
          {usersPlain.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <UsersList users={usersPlain} onDelete={deleteUser} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
