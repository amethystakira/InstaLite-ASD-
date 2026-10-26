
export async function list(req, res) {
  const pageParam = req.query.page;
  const limitParam = req.query.limit;

  const page = pageParam === undefined ? 1 : Number(pageParam);
  let limit = limitParam === undefined ? 10 : Number(limitParam);

  const sortBy = req.query.sortBy ?? "createdAt";
  const order = req.query.order ?? "desc";
  const isPrivateParam = req.query.isPrivate;
  const hasPostsParam = req.query.hasPosts;
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

  if (
    hasPostsParam !== undefined &&
    !["true", "false"].includes(hasPostsParam)
  ) {
    return res.status(400).json({
      error: "hasPosts must be true or false",
    });
  }

  const filters = {
    ...(isPrivateParam !== undefined && {
      isPrivate: isPrivateParam === "true",
    }),
    ...(hasPostsParam !== undefined && {
      hasPosts: hasPostsParam === "true",
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
