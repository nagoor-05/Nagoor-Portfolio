export function validateContentSection(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) errors.push("Request body must be an object");
  if (body.data !== undefined && (typeof body.data !== "object" || Array.isArray(body.data) || body.data === null)) {
    errors.push("data must be an object");
  }
  if (body.isVisible !== undefined && typeof body.isVisible !== "boolean") errors.push("isVisible must be true or false");
  return errors;
}
