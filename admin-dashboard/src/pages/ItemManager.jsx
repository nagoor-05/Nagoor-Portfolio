import { useEffect, useMemo, useState } from "react";
import { FaPen, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { api } from "../services/api";
import { PageHeading, label } from "./Dashboard";

const emptyForm = { id: "", title: "", order: 0, isVisible: true, data: "{}" };

export default function ItemManager({ collection }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const load = () => api(`/${collection}/admin`).then(setItems).catch((requestError) => setError(requestError.message));
  useEffect(() => { setOpen(false); setForm(emptyForm); setError(""); setSearch(""); setPage(1); load(); }, [collection]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(query));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const edit = (item) => {
    const { id, title, order, isVisible, slug, ...data } = item;
    setForm({ id, title: title || "", order: order || 0, isVisible: isVisible !== false, data: JSON.stringify({ slug, ...data }, null, 2) });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      const data = JSON.parse(form.data);
      const body = { title: form.title, order: Number(form.order), isVisible: form.isVisible, ...data };
      await api(form.id ? `/${collection}/${form.id}` : `/${collection}`, { method: form.id ? "PUT" : "POST", body: JSON.stringify(body) });
      setOpen(false);
      setForm(emptyForm);
      setError("");
      await load();
    } catch (saveError) {
      setError(saveError instanceof SyntaxError ? "The item content contains invalid JSON." : saveError.message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title || label(collection)}"?`)) return;
    try { await api(`/${collection}/${item.id}`, { method: "DELETE" }); await load(); }
    catch (requestError) { setError(requestError.message); }
  };

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Repeatable content" title={label(collection)} description="Add, edit, hide, reorder, or remove items without changing frontend code." actions={
        <button className="primary-action" onClick={() => { setForm(emptyForm); setOpen(true); }}><FaPlus /> Add item</button>
      } />
      {error && <div className="admin-error">{error}</div>}
      <section className="admin-panel">
        <div className="table-toolbar">
          <label>
            Search
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder={`Search ${label(collection).toLowerCase()}`}
            />
          </label>
          <span>{filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}</span>
        </div>
        <div className="data-table item-table">
          <div className="table-row table-head"><span>Title</span><span>Order</span><span>Status</span><span>Actions</span></div>
          {visibleItems.length ? visibleItems.map((item) => (
            <div className="table-row" key={item.id}>
              <strong>{item.title || "Untitled"}</strong><span>{item.order}</span><span className={item.isVisible ? "status-live" : "status-hidden"}>{item.isVisible ? "Live" : "Hidden"}</span>
              <span className="row-actions"><button title="Edit" onClick={() => edit(item)}><FaPen /></button><button title="Delete" onClick={() => remove(item)}><FaTrash /></button></span>
            </div>
          )) : <p className="empty-state">No matching {label(collection).toLowerCase()} found.</p>}
        </div>
        <div className="pagination">
          <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </section>
      {open && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
        <form className="admin-modal" onSubmit={save}>
          <header><div><span>{form.id ? "Edit item" : "New item"}</span><h2>{label(collection)}</h2></div><button type="button" title="Close" onClick={() => setOpen(false)}><FaXmark /></button></header>
          <div className="form-grid">
            <label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
            <label>Display order<input type="number" value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} /></label>
          </div>
          <label className="toggle"><input type="checkbox" checked={form.isVisible} onChange={(event) => setForm({ ...form, isVisible: event.target.checked })} /><span /> Visible on portfolio</label>
          <label className="json-editor"><span>All item fields</span><textarea value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} spellCheck="false" /></label>
          <footer><button type="button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-action" type="submit">Save item</button></footer>
        </form>
      </div>}
    </div>
  );
}
