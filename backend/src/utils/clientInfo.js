export function getClientInfo(req) {
  const agent = req.get("user-agent") || "";
  const browser = /Edg/i.test(agent) ? "Edge" : /Chrome/i.test(agent) ? "Chrome" : /Firefox/i.test(agent) ? "Firefox" : /Safari/i.test(agent) ? "Safari" : "Other";
  const device = /mobile|android|iphone/i.test(agent) ? "mobile" : /tablet|ipad/i.test(agent) ? "tablet" : "desktop";
  const country = req.get("x-vercel-ip-country") || req.get("cf-ipcountry") || req.get("x-country") || "Unknown";
  const rawCity = req.get("x-vercel-ip-city") || req.get("x-city") || "Unknown";
  let city = rawCity;
  try {
    city = decodeURIComponent(rawCity);
  } catch {
    city = rawCity;
  }
  return { browser, device, country, city };
}
