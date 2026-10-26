
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
export async function listPosts(
  page,
  limit,
  sortBy = "createdAt",
  order = "desc",
  filters = {}
) {
  const skip = (page - 1) * limit;
  const where = {};

  // Filter by location (case-insensitive)
  if (filters.location) {
    where.location = {
      equals: filters.location,
      mode: "insensitive",
    };
  }

  // Search captions (case-insensitive)
  if (filters.search) {
    where.caption = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  // Filter by creation date range
  if (filters.from || filters.to) {
    where.createdAt = {};

    if (filters.from) {
      where.createdAt.gte = new Date(filters.from);
    }

    if (filters.to) {
      where.createdAt.lt = new Date(filters.to);
    }
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
      include: {
        user: true,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
 