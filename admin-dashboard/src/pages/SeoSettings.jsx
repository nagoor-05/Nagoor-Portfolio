import { useEffect, useState } from "react";
import { FaCheck, FaExternalLinkAlt } from "react-icons/fa";
import { API_URL, api } from "../services/api";
import { PageHeading } from "./Dashboard";

const USERNAME = import.meta.env.VITE_PORTFOLIO_USERNAME || "nagoor";

const emptySeo = {
  title: "",
  description: "",
  keywords: [],
  canonicalUrl: "",
  siteUrl: "",
  socialPreviewImage: "",
  openGraph: { title: "", description: "", type: "website", url: "", image: "" },
  twitter: { card: "summary_large_image", title: "", description: "", image: "" },
  structuredData: { enabled: true, type: "Person" },
};

export default function SeoSettings() {
  const [seo, setSeo] = useState(emptySeo);
  const [isVisible, setIsVisible] = useState(true);
  const [keywordsText, setKeywordsText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api("/seo/admin")
      .then((payload) => {
        setSeo({ ...emptySeo, ...payload.data });
        setIsVisible(payload.isVisible);
        setKeywordsText((payload.data.keywords || []).join(", "));
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const update = (path, value) => {
    setSeo((current) => {
      const copy = structuredClone(current);
      const keys = path.split(".");
      let target = copy;
      for (const key of keys.slice(0, -1)) target = target[key];
      target[keys.at(-1)] = value;
      return copy;
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    const data = {
      ...seo,
      keywords: keywordsText.split(",").map((item) => item.trim()).filter(Boolean),
    };
    try {
      const payload = await api("/seo", {
        method: "PUT",
        body: JSON.stringify({ data, isVisible }),
      });
      setSeo({ ...emptySeo, ...payload.data });
      setStatus("SEO settings saved successfully.");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-page">
      <PageHeading
        eyebrow="Search visibility"
        title="SEO Engine"
        description="Manage meta tags, Open Graph previews, Twitter cards, sitemap, robots.txt, canonical URLs, and structured data."
      />
      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success"><FaCheck /> {status}</div>}
      <form className="admin-page" onSubmit={save}>
        <section className="admin-panel form-section">
          <div className="panel-heading"><div><span>Meta</span><h2>Portfolio level SEO</h2></div><label className="toggle"><input type="checkbox" checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} /><span />Visible</label></div>
          <div className="form-grid two-columns">
            <label>Meta Title<input value={seo.title} onChange={(event) => update("title", event.target.value)} /></label>
            <label>Canonical URL<input value={seo.canonicalUrl || ""} onChange={(event) => update("canonicalUrl", event.target.value)} /></label>
            <label className="full-field">Meta Description<textarea rows={4} value={seo.description} onChange={(event) => update("description", event.target.value)} /></label>
            <label className="full-field">Keywords<input value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} placeholder="React, AI ML, Full Stack" /></label>
            <label>Site URL<input value={seo.siteUrl || ""} onChange={(event) => update("siteUrl", event.target.value)} /></label>
            <label>Social Preview Image<input value={seo.socialPreviewImage || ""} onChange={(event) => update("socialPreviewImage", event.target.value)} /></label>
          </div>
        </section>
        <div className="dashboard-grid">
          <section className="admin-panel form-section">
            <div className="panel-heading"><div><span>Social</span><h2>Open Graph</h2></div></div>
            <div className="form-grid single-column">
              <label>OG Title<input value={seo.openGraph?.title || ""} onChange={(event) => update("openGraph.title", event.target.value)} /></label>
              <label>OG Description<textarea rows={3} value={seo.openGraph?.description || ""} onChange={(event) => update("openGraph.description", event.target.value)} /></label>
              <label>OG Image<input value={seo.openGraph?.image || ""} onChange={(event) => update("openGraph.image", event.target.value)} /></label>
              <label>OG URL<input value={seo.openGraph?.url || ""} onChange={(event) => update("openGraph.url", event.target.value)} /></label>
            </div>
          </section>
          <section className="admin-panel form-section">
            <div className="panel-heading"><div><span>Social</span><h2>Twitter Cards</h2></div></div>
            <div className="form-grid single-column">
              <label>Card Type<input value={seo.twitter?.card || "summary_large_image"} onChange={(event) => update("twitter.card", event.target.value)} /></label>
              <label>Twitter Title<input value={seo.twitter?.title || ""} onChange={(event) => update("twitter.title", event.target.value)} /></label>
              <label>Twitter Description<textarea rows={3} value={seo.twitter?.description || ""} onChange={(event) => update("twitter.description", event.target.value)} /></label>
              <label>Twitter Image<input value={seo.twitter?.image || ""} onChange={(event) => update("twitter.image", event.target.value)} /></label>
            </div>
          </section>
        </div>
        <section className="admin-panel">
          <div className="panel-heading"><div><span>Generated Files</span><h2>Sitemap, robots.txt, and schema</h2></div></div>
          <div className="seo-links">
            <a href={`${API_URL}/seo/sitemap.xml?username=${USERNAME}`} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> Sitemap XML</a>
            <a href={`${API_URL}/seo/robots.txt?username=${USERNAME}`} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> Robots TXT</a>
            <a href={`${API_URL}/seo/schema.json?username=${USERNAME}`} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> Structured Data</a>
          </div>
        </section>
        <button className="primary-action" type="submit">Save SEO Settings</button>
      </form>
    </div>
  );
}
