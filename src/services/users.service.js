
import prisma from "../db.js";

// Create a user
export async function createUser(data) {
  return prisma.user.create({ data });
}

// List all users
export async function listUsers() {
  return prisma.user.findMany();
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
