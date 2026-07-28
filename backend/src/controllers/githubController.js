import { getLiveGitHubProfile } from "../services/githubService.js";
import { sendSuccess } from "../utils/response.js";

export async function getLiveGitHub(req, res) {
  const forceRefresh = req.query.refresh === "true";
  const data = await getLiveGitHubProfile({ forceRefresh });
  return sendSuccess(res, data, "Live GitHub profile loaded");
}
