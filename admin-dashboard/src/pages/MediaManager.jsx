import { useEffect, useMemo, useState } from "react";
import { FaCopy, FaPen, FaPlus, FaTrash, FaUpload } from "react-icons/fa6";
import { API_URL, api } from "../services/api";
import { PageHeading } from "./Dashboard";

const API_ROOT = API_URL.replace(/\/api$/, "");
const categories = ["profile", "cover", "project-image", "project-video", "resume", "certificate", "blog-image", "icon", "model", "other"];

const emptyUpload = {
  title: "",
  category: "project-image",
  altText: "",
  tags: "",
  file: null,
};

export default function MediaManager() {
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(emptyUpload);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api(`/media?search=${encodeURIComponent(search)}&category=${category}`).then(setAssets).catch((requestError) => setError(requestError.message));

  useEffect(() => { load(); }, [category]);

  const filtered = useMemo(() => assets, [assets]);

  const upload = async (event) => {
    event.preventDefault();
    if (!form.file) {
      setError("Choose a file before uploading.");
      return;
    }
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const dataUrl = await readFile(form.file);
      await api("/media/upload", {
        method: "POST",
        body: JSON.stringify({
          title: form.title || form.file.name,
          fileName: form.file.name,
          mimeType: form.file.type || "application/octet-stream",
          category: form.category,
          altText: form.altText,
          tags: toTags(form.tags),
          dataUrl,
        }),
      });
      setForm(emptyUpload);
      setStatus("Media uploaded successfully.");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (asset) => {
    if (!window.confirm(`Delete "${asset.title}"?`)) return;
    try {
      await api(`/media/${asset.id}`, { method: "DELETE" });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const copyUrl = async (url) => {
    const fullUrl = absoluteUrl(url);
    await navigator.clipboard?.writeText(fullUrl);
    setStatus("Media URL copied.");
  };

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Assets" title="Media Manager" description="Upload, preview, organize, search, copy, replace, and delete portfolio media." />
      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success">{status}</div>}
      <section className="admin-panel">
        <div className="panel-heading"><div><span>Upload</span><h2>Add media</h2></div></div>
        <form className="media-upload" onSubmit={upload}>
          <label>File<input type="file" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} /></label>
          <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Alt Text<input value={form.altText} onChange={(event) => setForm({ ...form, altText: event.target.value })} /></label>
          <label className="full-field">Tags<input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="profile, hero, project" /></label>
          <button className="primary-action" disabled={busy} type="submit"><FaUpload /> {busy ? "Uploading..." : "Upload"}</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="table-toolbar">
          <label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} placeholder="Search title, alt text, tags" /></label>
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <button className="primary-action" type="button" onClick={load}><FaPlus /> Filter</button>
        </div>
        <div className="media-grid">
          {filtered.length ? filtered.map((asset) => (
            <article className="media-card" key={asset.id}>
              <MediaPreview asset={asset} />
              <div>
                <strong>{asset.title}</strong>
                <span>{asset.category} • {formatSize(asset.size)}</span>
              </div>
              <div className="row-actions">
                <button title="Copy URL" onClick={() => copyUrl(asset.url)}><FaCopy /></button>
                <ReplaceButton asset={asset} onDone={load} onError={setError} />
                <button title="Delete" onClick={() => remove(asset)}><FaTrash /></button>
              </div>
            </article>
          )) : <p className="empty-state">No media assets found.</p>}
        </div>
      </section>
    </div>
  );
}

function MediaPreview({ asset }) {
  const url = absoluteUrl(asset.url);
  if (asset.mimeType?.startsWith("image/")) return <img src={url} alt={asset.altText || asset.title} />;
  if (asset.mimeType?.startsWith("video/")) return <video src={url} controls />;
  return <div className="media-file">{asset.mimeType?.includes("pdf") ? "PDF" : "FILE"}</div>;
}

function ReplaceButton({ asset, onDone, onError }) {
  const replace = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFile(file);
      await api(`/media/${asset.id}/replace`, {
        method: "PUT",
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          dataUrl,
        }),
      });
      await onDone();
    } catch (requestError) {
      onError(requestError.message);
    }
  };
  return <label className="icon-upload" title="Replace"><FaPen /><input type="file" onChange={replace} /></label>;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toTags(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function absoluteUrl(url) {
  return url?.startsWith("http") ? url : `${API_ROOT}${url}`;
}

function formatSize(size = 0) {
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size > 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}
