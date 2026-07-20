export function sendSuccess(res, data, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}
