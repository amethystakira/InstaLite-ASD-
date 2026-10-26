import { Router } from "express";
import prisma from "../db.js";

const router = Router();

// Create a user
router.post("/", async (req, res) => {
  const { username, email, fullname, bio } = req.body ?? {};

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required",
    });
  }

  try {
    const user = await prisma.user.create({
      data: { username, email, fullname, bio },
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "username or email already taken",
      });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get one user
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update a user
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { fullname, bio, isPrivate } = req.body ?? {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const data = {};
  if (fullname !== undefined) data.fullname = fullname;
  if (bio !== undefined) data.bio = bio;
  if (isPrivate !== undefined) data.isPrivate = isPrivate;

  try {
    const user = await prisma.user.update({ where: { id }, data });
    return res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
