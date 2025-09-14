// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// simple PRNG for reproducible “randomness”
let _seed = 42;
function rnd() {
  _seed = (_seed * 1664525 + 1013904223) % 0xffffffff;
  return _seed / 0xffffffff;
}
function randInt(min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  // jitter within the day for nicer charts
  d.setHours(randInt(8, 22), randInt(0, 59), randInt(0, 59), 0);
  return d;
}

const NAMES = [
  "Alex Chen", "Priya Singh", "Liam O'Connor", "Maya Rodríguez",
  "Samir Patel", "Elena Petrova", "Noah Johnson", "Aisha Khan",
  "Jonas Müller", "Sofia Rossi",
];

const SAMPLE_TITLES = [
  "Hello world", "Today I learned…", "Quick tip for Next.js",
  "Why I love SQLite", "Server Actions FTW", "Type safety matters",
  "Debugging Recharts", "Zod vs Yup", "Tailwind tricks", "Refactor notes"
];

const SAMPLE_BODIES = [
  "Short note about my setup and a couple of gotchas.",
  "Sharing a tiny snippet that saved me time.",
  "Writing down what broke and how I fixed it for future me.",
  "Some thoughts on developer experience and trade-offs.",
  "Leaving this here so I don’t forget tomorrow."
];

async function main() {
  console.log("🌱 Seeding…");
  // Clean slate (order matters due to FK)
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users and posts
  for (let i = 0; i < NAMES.length; i++) {
    const name = NAMES[i];
    const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;

    const userCreatedAt = daysAgo(randInt(20, 120));
    const user = await prisma.user.create({
      data: { name, email, createdAt: userCreatedAt },
      select: { id: true },
    });

    // each user gets 2–10 posts sprinkled over last 30 days
    const postCount = randInt(2, 10);
    const postsData = Array.from({ length: postCount }).map(() => {
      const day = randInt(0, 30);
      return {
        title: SAMPLE_TITLES[randInt(0, SAMPLE_TITLES.length - 1)],
        body: SAMPLE_BODIES[randInt(0, SAMPLE_BODIES.length - 1)],
        createdAt: daysAgo(day),
        authorId: user.id,
      };
    });

    // insert in small batches
    for (const data of postsData) {
      await prisma.post.create({ data });
    }
  }

  console.log("✅ Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
