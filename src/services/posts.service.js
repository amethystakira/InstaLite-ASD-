
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

export async function getPostLikes(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      likes: {
        orderBy: {
          user: {
            username: "asc",
          },
        },
        select: {
          user: {
            select: {
              id: true,
              username: true,
              fullname: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    return null;
  }

  return post.likes.map((like) => like.user);
}


export async function likePost(postId, userId) {
  const [post, user] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    }),
  ]);

  if (!post) {
    return { error: "Post not found", status: 404 };
  }

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  if (existingLike) {
    return { error: "Already liked", status: 409 };
  }

  const like = await prisma.like.create({
    data: { userId, postId },
  });

  return { data: like };
}


export async function likePostController(req, res) {
  const postId = Number(req.params.id);
  const userId = Number(req.body.userId);

  if (req.body.userId === undefined || req.body.userId === null || req.body.userId === "") {
    return res.status(400).json({ error: "userId is required" });
  }

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const result = await likePost(postId, userId);

    if (result.error) {
      return res.status(result.status).json({
        error: result.error,
      });
    }

    return res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


export async function unlikePost(postId, userId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    return { error: "Post not found", status: 404 };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  if (!existingLike) {
    return { error: "Like not found", status: 404 };
  }

  await prisma.like.delete({
    where: {
      userId_postId: { userId, postId },
    },
  });

  return { message: "Like removed successfully" };
}
