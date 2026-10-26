
import prisma from "../src/db.js";
import { users, posts } from "./seed-data.js";

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const userData = users.map((user) => ({
    ...user,
    createdAt: new Date(user.createdAt),
  }));

  const createdUsers = await prisma.user.createManyAndReturn({
    data: userData,
  });

  const postData = posts.map((post, index) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    userId: createdUsers[index % createdUsers.length].id,
  }));

  const createdPosts = await prisma.post.createManyAndReturn({
    data: postData,
  });

  console.log(
    `Seeded ${createdUsers.length} users and ${createdPosts.length} posts`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
