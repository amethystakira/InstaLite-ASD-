import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { users, posts, likes } from "./seed-data.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data in dependency order
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users and build a username-to-ID map
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users,
  });

  const userIdMap = new Map(
    createdUsers.map((user) => [user.username, user.id])
  );

  // Create posts using author IDs
  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map(({ author, ...post }) => ({
      ...post,
      authorId: userIdMap.get(author),
    })),
  });

  // Map image seed keys (insta01, insta02...) to post IDs
  const postIdMap = new Map(
    createdPosts.map((post) => [
      post.imageUrl.split("/")[4],
      post.id,
    ])
  );

  // Create likes using user and post IDs
  const createdLikes = await prisma.like.createMany({
    data: likes.map(({ user, post }) => ({
      userId: userIdMap.get(user),
      postId: postIdMap.get(post),
    })),
  });

  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`
  );
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
