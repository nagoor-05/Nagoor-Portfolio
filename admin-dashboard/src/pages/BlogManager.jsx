import { useEffect, useMemo, useState } from "react";
import { FaPen, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { api } from "../services/api";
import { PageHeading } from "./Dashboard";

const emptyArticle = {
  id: "",
  title: "",
  slug: "",
  category: "Learning",
  description: "",
  coverImage: "",
  readTime: "3 min read",
  tags: "",
  content: "",
  featured: false,
  isVisible: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  order: 0,
};

export default function BlogManager() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(emptyArticle);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const load = () => api("/articles/admin").then(setArticles).catch((requestError) => setError(requestError.message));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return articles;
    return articles.filter((article) => JSON.stringify(article).toLowerCase().includes(query));
  }, [articles, search]);

  const edit = (article) => {
    setForm({
      id: article.id,
      title: article.title || "",
      slug: article.slug || "",
      category: article.category || "Learning",
      description: article.description || "",
      coverImage: article.coverImage || "",
      readTime: article.readTime || "3 min read",
      tags: (article.tags || []).join(", "),
      content: article.content || "",
      featured: Boolean(article.featured),
      isVisible: article.isVisible !== false,
      seoTitle: article.seo?.title || "",
      seoDescription: article.seo?.description || "",
      seoKeywords: (article.seo?.keywords || []).join(", "),
      order: article.order || 0,
    });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const body = {
      title: form.title,
      slug: form.slug,
      order: Number(form.order),
      isVisible: form.isVisible,
      category: form.category,
      description: form.description,
      coverImage: form.coverImage,
      readTime: form.readTime,
      tags: toList(form.tags),
      content: form.content,
      featured: form.featured,
      seo: {
        title: form.seoTitle || form.title,
        description: form.seoDescription || form.description,
        keywords: toList(form.seoKeywords),
      },
    };
    try {
      await api(form.id ? `/articles/${form.id}` : "/articles", {
        method: form.id ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      setOpen(false);
      setForm(emptyArticle);
      setError("");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const remove = async (article) => {
    if (!window.confirm(`Delete "${article.title}"?`)) return;
    try {
      await api(`/articles/${article.id}`, { method: "DELETE" });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Blog CMS" title="Blog / Articles" description="Create, edit, draft, publish, unpublish, categorize, tag, and feature portfolio articles." actions={
        <button className="primary-action" onClick={() => { setForm(emptyArticle); setOpen(true); }}><FaPlus /> New Article</button>
      } />
      {error && <div className="admin-error">{error}</div>}
      <section className="admin-panel">
        <div className="table-toolbar">
          <label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles" /></label>
          <span>{filtered.length} article{filtered.length === 1 ? "" : "s"}</span>
        </div>
        <div className="data-table blog-table">
          <div className="table-row table-head"><span>Article</span><span>Category</span><span>Status</span><span>Featured</span><span>Actions</span></div>
          {filtered.length ? filtered.map((article) => (
            <div className="table-row" key={article.id}>
              <strong>{article.title}</strong>
              <span>{article.category || "General"}</span>
              <span className={article.isVisible ? "status-live" : "status-hidden"}>{article.isVisible ? "Published" : "Draft"}</span>
              <span>{article.featured ? "Yes" : "No"}</span>
              <span className="row-actions"><button onClick={() => edit(article)} title="Edit"><FaPen /></button><button onClick={() => remove(article)} title="Delete"><FaTrash /></button></span>
            </div>
          )) : <p className="empty-state">No articles found.</p>}
        </div>
      </section>
      {open && <Editor form={form} setForm={setForm} save={save} close={() => setOpen(false)} />}
    </div>
  );
}

function Editor({ form, setForm, save, close }) {
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <form className="admin-modal wide-modal" onSubmit={save}>
        <header><div><span>{form.id ? "Edit article" : "New article"}</span><h2>{form.title || "Article"}</h2></div><button type="button" onClick={close}><FaXmark /></button></header>
        <div className="form-grid two-columns">
          <label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} required /></label>
          <label>Slug<input value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="my-article-slug" /></label>
          <label>Category<input value={form.category} onChange={(event) => update("category", event.target.value)} /></label>
          <label>Read Time<input value={form.readTime} onChange={(event) => update("readTime", event.target.value)} /></label>
          <label className="full-field">Description<textarea rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
          <label>Cover Image URL<input value={form.coverImage} onChange={(event) => update("coverImage", event.target.value)} /></label>
          <label>Tags<input value={form.tags} onChange={(event) => update("tags", event.target.value)} placeholder="React, Learning" /></label>
          <label className="full-field">Content<textarea rows={12} value={form.content} onChange={(event) => update("content", event.target.value)} placeholder="Write the article content here..." /></label>
          <label>SEO Title<input value={form.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} /></label>
          <label>SEO Keywords<input value={form.seoKeywords} onChange={(event) => update("seoKeywords", event.target.value)} /></label>
          <label className="full-field">SEO Description<textarea rows={3} value={form.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} /></label>
        </div>
        <div className="toggle-row">
          <label className="toggle"><input type="checkbox" checked={form.isVisible} onChange={(event) => update("isVisible", event.target.checked)} /><span /> Published</label>
          <label className="toggle"><input type="checkbox" checked={form.featured} onChange={(event) => update("featured", event.target.checked)} /><span /> Featured</label>
          <label>Order<input type="number" value={form.order} onChange={(event) => update("order", event.target.value)} /></label>
        </div>
        <footer><button type="button" onClick={close}>Cancel</button><button className="primary-action" type="submit">Save Article</button></footer>
      </form>
    </div>
  );
}

function toList(value = "") {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
