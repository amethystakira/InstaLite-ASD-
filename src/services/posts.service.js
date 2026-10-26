
import prisma from "../db.js";

// Create a post
export async function createPost(data) {
  const user = await prisma.user.findFirst({
    orderBy: { id: "asc" },
  });

  if (!user) {
    throw new Error("A user must exist before creating a post");
  }

  return prisma.post.create({
    data: {
      ...data,
      userId: user.id,
    },
  });
}

// List all posts
export async function listPosts() {
  return prisma.post.findMany();
}

// Find a post by ID
export async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id },
  });
}

// Update a post
export async function updatePost(id, data) {
  return prisma.post.update({
    where: { id },
    data,
  });
}

// Delete a post
export async function deletePost(id) {
  return prisma.post.delete({
    where: { id },
  });
}
