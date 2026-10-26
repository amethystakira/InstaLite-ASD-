
import {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../services/posts.service.js";

// Create a post
export async function create(req, res) {
  try {
    const { caption, imageUrl, location, authorId } = req.body;

    if (!imageUrl || !authorId) {
      return res.status(400).json({
        error: "imageUrl and authorId are required",
      });
    }

    const post = await createPost({
      caption,
      imageUrl,
      location,
      authorId: Number(authorId),
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// List posts with filtering, sorting, and pagination
export async function list(req, res) {
  const pageParam = req.query.page;
  const limitParam = req.query.limit;

  const page = pageParam === undefined ? 1 : Number(pageParam);
  let limit = limitParam === undefined ? 10 : Number(limitParam);

  const sortBy = req.query.sortBy ?? "createdAt";
  const order = req.query.order ?? "desc";

  const { location, search, from, to } = req.query;

  // Validate pagination
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

  // Validate sorting
  const allowedSortFields = ["createdAt", "updatedAt", "likes"];

  if (!allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, updatedAt, likes",
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  // Validate date filters
  const isValidDate = (value) =>
    !Number.isNaN(Date.parse(value)) &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

  if (
    (from !== undefined && !isValidDate(from)) ||
    (to !== undefined && !isValidDate(to))
  ) {
    return res.status(400).json({
      error: "from and to must be valid dates",
    });
  }

  if (from && to && new Date(from) >= new Date(to)) {
    return res.status(400).json({
      error: "from and to must be valid dates",
    });
  }

  try {
    const filters = { location, search, from, to };
    const result = await listPosts(page, limit, sortBy, order, filters);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get a single post
export async function getById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Update a post
export async function update(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    // Never allow authorId to be changed through PATCH
    const { authorId, ...data } = req.body;

    const post = await updatePost(id, data);

    return res.status(200).json(post);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Delete a post
export async function remove(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await deletePost(id);

    return res.status(200).json(post);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
