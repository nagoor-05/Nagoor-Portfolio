import { app } from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";

let ready;

export default async function handler(req, res) {
  if (req.url === "/health" || req.url?.startsWith("/api/health")) {
    return app(req, res);
  }

  ready ||= connectDatabase();
  await ready;
  return app(req, res);
}
