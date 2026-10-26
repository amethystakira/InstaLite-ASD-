
import prisma from "../db.js";

// Create a user
export async function createUser(data) {
  return prisma.user.create({ data });
}

// List all users
export async function listUsers(
  page,
  limit,
  sortBy = "createdAt",
  order = "desc",
  filters = {}
) {
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.isPrivate !== undefined) {
    where.isPrivate = filters.isPrivate;
  }

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

// Find a user by ID
export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
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
