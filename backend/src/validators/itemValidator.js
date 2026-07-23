export function validatePortfolioItem(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) errors.push("Request body must be an object");
  if (body.title !== undefined && typeof body.title !== "string") errors.push("title must be a string");
  if (body.slug !== undefined && typeof body.slug !== "string") errors.push("slug must be a string");
  if (body.order !== undefined && Number.isNaN(Number(body.order))) errors.push("order must be a number");
  if (body.isVisible !== undefined && typeof body.isVisible !== "boolean") errors.push("isVisible must be true or false");
  if (body.tags !== undefined && !Array.isArray(body.tags)) errors.push("tags must be an array");
  if (body.aliases !== undefined && !Array.isArray(body.aliases)) errors.push("aliases must be an array");
  if (body.keywords !== undefined && !Array.isArray(body.keywords)) errors.push("keywords must be an array");
  if (body.categories !== undefined && !Array.isArray(body.categories)) errors.push("categories must be an array");
  if (body.technologies !== undefined && !Array.isArray(body.technologies)) errors.push("technologies must be an array");
  if (body.techStack !== undefined && !Array.isArray(body.techStack) && (typeof body.techStack !== "object" || body.techStack === null)) {
    errors.push("techStack must be an array or object");
  }
  if (body.percentage !== undefined) {
    const value = Number(body.percentage);
    if (Number.isNaN(value) || value < 0 || value > 100) errors.push("percentage must be between 0 and 100");
  }
  return errors;
}
