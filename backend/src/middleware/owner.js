import { getOwner } from "../services/portfolioService.js";

export async function resolveOwner(req, res, next) {
  const username = req.params.username || req.query.username || "nagoor";
  const owner = await getOwner(username);
  if (!owner) return res.status(404).json({ success: false, message: "Portfolio owner not found" });
  req.owner = owner;
  next();
}
