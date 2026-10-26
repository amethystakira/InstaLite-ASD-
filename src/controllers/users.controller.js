
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../services/users.service.js";

// Create a user
export async function create(req, res) {
  const { username, email, fullname, bio } = req.body ?? {};

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required",
    });
  }

  try {
    const user = await createUser({ username, email, fullname, bio });
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
}

// Get all users
export async function list(req, res) {
  const pageParam = req.query.page;
  const limitParam = req.query.limit;

  const page = pageParam === undefined ? 1 : Number(pageParam);
  let limit = limitParam === undefined ? 10 : Number(limitParam);

  const sortBy = req.query.sortBy ?? "createdAt";
  const order = req.query.order ?? "desc";
  const isPrivateParam = req.query.isPrivate;
  const search = req.query.search;

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  limit = Math.min(limit, 50);

  const allowedSortFields = ["createdAt", "username", "fullname"];

  if (!allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, username, fullname",
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  if (
    isPrivateParam !== undefined &&
    !["true", "false"].includes(isPrivateParam)
  ) {
    return res.status(400).json({
      error: "isPrivate must be true or false",
    });
  }

  const filters = {
    ...(isPrivateParam !== undefined && {
      isPrivate: isPrivateParam === "true",
    }),
    ...(search && { search }),
  };

  try {
    const result = await listUsers(page, limit, sortBy, order, filters);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


// Get one user
export async function getOne(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Update a user
export async function update(req, res) {
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
    const user = await updateUser(id, data);
    return res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Delete a user
export async function remove(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    await deleteUser(id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
