import { ContentSection } from "../models/ContentSection.js";
import { getPortfolio } from "../services/portfolioService.js";
import { sendSuccess } from "../utils/response.js";

const defaultSeo = {
  title: "Mohammed Nagoor Meerasha | Cinematic Portfolio",
  description: "AI/ML learner, full stack developer, Java and C++ programmer.",
  keywords: ["Mohammed Nagoor Meerasha", "AI ML Learner", "Full Stack Developer", "React Developer"],
  canonicalUrl: "",
  siteUrl: "",
  socialPreviewImage: "/preview.png",
  openGraph: {
    title: "",
    description: "",
    type: "website",
    url: "",
    image: "",
  },
  twitter: {
    card: "summary_large_image",
    title: "",
    description: "",
    image: "",
  },
  structuredData: {
    enabled: true,
    type: "Person",
  },
};

function mergeSeo(data = {}, owner = {}) {
  const title = data.title || defaultSeo.title;
  const description = data.description || defaultSeo.description;
  const socialPreviewImage = data.socialPreviewImage || data.openGraph?.image || defaultSeo.socialPreviewImage;
  return {
    ...defaultSeo,
    ...data,
    title,
    description,
    keywords: Array.isArray(data.keywords)
      ? data.keywords
      : String(data.keywords || defaultSeo.keywords.join(","))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    socialPreviewImage,
    openGraph: {
      ...defaultSeo.openGraph,
      ...data.openGraph,
      title: data.openGraph?.title || title,
      description: data.openGraph?.description || description,
      image: data.openGraph?.image || socialPreviewImage,
    },
    twitter: {
      ...defaultSeo.twitter,
      ...data.twitter,
      title: data.twitter?.title || title,
      description: data.twitter?.description || description,
      image: data.twitter?.image || socialPreviewImage,
    },
    structuredData: {
      ...defaultSeo.structuredData,
      ...data.structuredData,
      name: data.structuredData?.name || owner.name || "Mohammed Nagoor Meerasha",
    },
  };
}

async function getSeoSection(ownerId, includeHidden = false) {
  const visibility = includeHidden ? {} : { isVisible: true };
  return ContentSection.findOne({ ownerId, key: "seo", ...visibility }).lean();
}

function baseUrl(req, seo = {}) {
  return (seo.siteUrl || seo.canonicalUrl || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
}

function xmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function getSeo(req, res) {
  const section = await getSeoSection(req.owner._id);
  return sendSuccess(res, mergeSeo(section?.data, req.owner));
}

export async function getAdminSeo(req, res) {
  const section = await getSeoSection(req.user._id, true);
  return sendSuccess(res, {
    data: mergeSeo(section?.data, req.user),
    isVisible: section?.isVisible ?? true,
  });
}

export async function updateSeo(req, res) {
  const data = req.body.data || req.body;
  const isVisible = req.body.isVisible ?? true;
  const section = await ContentSection.findOneAndUpdate(
    { ownerId: req.user._id, key: "seo" },
    { data: mergeSeo(data, req.user), isVisible },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return sendSuccess(res, { data: section.data, isVisible: section.isVisible }, "SEO settings updated");
}

export async function sitemap(req, res) {
  const section = await getSeoSection(req.owner._id);
  const seo = mergeSeo(section?.data, req.owner);
  const root = baseUrl(req, seo);
  const portfolio = await getPortfolio(req.owner.username);
  const routes = ["/home", "/about", "/skills", "/experience", "/projects", "/articles", "/resume", "/contact"];
  const urls = [
    root,
    ...routes.map((route) => `${root}${route}`),
    ...(portfolio?.projects || []).map((project) => `${root}/projects#${project.slug}`),
    ...(portfolio?.articles || []).map((article) => `${root}/articles#${article.slug}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${xmlEscape(url)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
    .join("\n")}\n</urlset>`;
  res.type("application/xml").send(body);
}

export async function robots(req, res) {
  const section = await getSeoSection(req.owner._id);
  const seo = mergeSeo(section?.data, req.owner);
  const apiRoot = `${req.protocol}://${req.get("host")}`;
  res
    .type("text/plain")
    .send(`User-agent: *\nAllow: /\n\nSitemap: ${apiRoot}/api/seo/sitemap.xml?username=${req.owner.username}\n`);
}

export async function structuredData(req, res) {
  const portfolio = await getPortfolio(req.owner.username);
  const section = await getSeoSection(req.owner._id);
  const seo = mergeSeo(section?.data, req.owner);
  const root = baseUrl(req, seo);
  const schema = {
    "@context": "https://schema.org",
    "@type": seo.structuredData?.type || "Person",
    name: portfolio.owner.name,
    url: root,
    description: seo.description,
    sameAs: (portfolio.socialLinks || []).map((item) => item.url).filter(Boolean),
    knowsAbout: [
      ...(portfolio.skills || []).map((skill) => skill.title),
      ...(portfolio.resume?.coreSkills || []),
    ].filter(Boolean),
    alumniOf: (portfolio.educations || []).map((item) => item.subtitle).filter(Boolean),
  };
  return sendSuccess(res, schema);
}
