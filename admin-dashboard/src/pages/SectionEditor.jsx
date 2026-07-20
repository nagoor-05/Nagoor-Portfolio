import { useEffect, useState } from "react";
import { FaCheck, FaFloppyDisk } from "react-icons/fa6";
import { api } from "../services/api";
import { PageHeading, label } from "./Dashboard";

export default function SectionEditor({ section }) {
  const [editor, setEditor] = useState("{}");
  const [visible, setVisible] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setStatus("");
    api(`/${section}/admin`).then((result) => {
      setEditor(JSON.stringify(result.data || {}, null, 2));
      setVisible(result.isVisible !== false);
    }).catch((requestError) => setError(requestError.message));
  }, [section]);

  const save = async () => {
    try {
      const data = JSON.parse(editor);
      setError("");
      setStatus("Saving...");
      await api(`/${section}`, { method: "PUT", body: JSON.stringify({ data, isVisible: visible }) });
      setStatus("Saved");
      window.setTimeout(() => setStatus(""), 1800);
    } catch (saveError) {
      setStatus("");
      setError(saveError instanceof SyntaxError ? "The content contains invalid JSON. Check commas and quotation marks." : saveError.message);
    }
  };

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Single content section" title={label(section)} description="Every field in this section is editable. Changes are used by the public portfolio on its next refresh." actions={
        <button className="primary-action" onClick={save}><FaFloppyDisk /> Save changes</button>
      } />
      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success"><FaCheck /> {status}</div>}
      <section className="admin-panel editor-panel">
        <div className="editor-toolbar">
          <label className="toggle"><input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} /><span /> Visible on portfolio</label>
          <small>Preserve field names so the existing design receives the right content.</small>
        </div>
        <label className="json-editor"><span>Complete section content</span><textarea value={editor} onChange={(event) => setEditor(event.target.value)} spellCheck="false" /></label>
      </section>
    </div>
  );
}
