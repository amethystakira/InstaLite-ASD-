
import prisma from "../db.js";

// Create a post
export async function createPost(data) {
  return prisma.post.create({
    data,
  });
}

// List posts with filtering, sorting, and pagination
export async function listPosts(
  page,
  limit,
  sortBy = "createdAt",
  order = "desc",
  filters = {}
) {
  const skip = (page - 1) * limit;
  const where = {};

  // Filter by location
  if (filters.location) {
    where.location = {
      equals: filters.location,
      mode: "insensitive",
    };
  }

  // Search captions
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

  // Sort by likes, using newest-first for ties
  const orderBy =
    sortBy === "likes"
      ? [
          { likes: { _count: order } },
          { createdAt: "desc" },
        ]
      : { [sortBy]: order };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
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
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
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
