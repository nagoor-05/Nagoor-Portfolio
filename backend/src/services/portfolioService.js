import { User } from "../models/User.js";
import { ContentSection } from "../models/ContentSection.js";
import { PortfolioItem } from "../models/PortfolioItem.js";

export async function getOwner(username = "nagoor") {
  return User.findOne({ username: username.toLowerCase(), isActive: true });
}

export async function getPortfolio(username = "nagoor", includeHidden = false) {
  const owner = await getOwner(username);
  if (!owner) return null;
  const visibility = includeHidden ? {} : { isVisible: true };
  const [sections, items] = await Promise.all([
    ContentSection.find({ ownerId: owner._id, ...visibility }).lean(),
    PortfolioItem.find({ ownerId: owner._id, ...visibility }).sort({ type: 1, order: 1, createdAt: 1 }).lean(),
  ]);
  const content = Object.fromEntries(sections.map((section) => [section.key, section.data]));
  const groupedItems = items.reduce((acc, item) => {
    const key = `${item.type}s`;
    acc[key] ||= [];
    acc[key].push({ id: item._id, slug: item.slug, title: item.title, ...item.data, order: item.order, isVisible: item.isVisible });
    return acc;
  }, {});
  return {
    owner: { id: owner._id, name: owner.name, username: owner.username },
    ...content,
    ...groupedItems,
  };
}

export function buildPortfolioContext(portfolio) {
  const safe = JSON.stringify(portfolio, null, 2);
  return `You are the portfolio copilot for ${portfolio.owner.name}. Answer clearly and professionally using only the supplied portfolio data. If information is absent, say it is not currently listed. Never invent achievements, links, employers, scores, or experience. When useful, include exact GitHub or live-demo links from the data.\n\nPORTFOLIO DATA:\n${safe}`;
}
