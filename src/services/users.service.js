
import prisma from "../db.js";

// Create a user
export async function createUser(data) {
  return prisma.user.create({ data });
}

// List users with filtering, sorting, and pagination
export async function listUsers(
  page,
  limit,
  sortBy = "createdAt",
  order = "desc",
  filters = {}
) {
  const skip = (page - 1) * limit;
  const where = {};

  // Filter by privacy
  if (filters.isPrivate !== undefined) {
    where.isPrivate = filters.isPrivate;
  }

  // Filter by whether the user has posts
  if (filters.hasPosts !== undefined) {
    where.posts = filters.hasPosts
      ? { some: {} }
      : { none: {} };
  }

  // Search username or fullname
  if (filters.search) {
    where.OR = [
      {
        username: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        fullname: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Find a user by ID, including post and like counts
export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
}

// Update a user
export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

// Delete a user
export async function deleteUser(id) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function getUserPosts(userId, page, limit) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({
      where: { authorId: userId },
    }),
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


export async function getUserLikedPosts(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  return prisma.post.findMany({
    where: {
      likes: {
        some: { userId },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { likes: true },
      },
    },
  });
}

