export function validatePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  let limit = query.limit === undefined ? 10 : Number(query.limit);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1
  ) {
    return {
      error: "page and limit must be positive integers",
    };
  }

  limit = Math.min(limit, 50);

  return { page, limit };
}