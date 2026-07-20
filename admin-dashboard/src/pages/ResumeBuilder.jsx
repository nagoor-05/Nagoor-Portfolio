import { useEffect, useMemo, useState } from "react";
import { FaDownload, FaEye, FaFloppyDisk, FaRobot, FaUpload } from "react-icons/fa6";
import { api } from "../services/api";
import { PageHeading } from "./Dashboard";

const emptyResume = {
  title: "Resume Overview",
  description: "",
  pdfUrl: "/Nagoor_Resume.pdf",
  version: "v1.0",
  versions: [],
  education: "",
  experience: "",
  projects: "",
  skills: "",
  certifications: "",
  achievements: "",
  coreSkills: "",
  aiNotes: "",
};

export default function ResumeBuilder() {
  const [form, setForm] = useState(emptyResume);
  const [visible, setVisible] = useState(true);
  const [resumeStats, setResumeStats] = useState({ downloads: 0 });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api("/resume/admin"), api("/analytics/resume")])
      .then(([section, analytics]) => {
        const data = section.data || {};
        setVisible(section.isVisible !== false);
        setForm({
          ...emptyResume,
          ...data,
          versions: data.versions || [],
          education: listToText(data.sections?.education || data.education),
          experience: listToText(data.sections?.experience || data.experience),
          projects: listToText(data.sections?.projects || data.projects),
          skills: listToText(data.sections?.skills || data.skills),
          certifications: listToText(data.sections?.certifications || data.certifications),
          achievements: listToText(data.sections?.achievements || data.achievements),
          coreSkills: listToText(data.coreSkills),
          aiNotes: data.ai?.notes || data.aiNotes || "",
        });
        setResumeStats(analytics);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const completion = useMemo(() => {
    const fields = ["title", "description", "pdfUrl", "education", "experience", "projects", "skills"];
    const completed = fields.filter((field) => String(form[field] || "").trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [form]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    try {
      const version = form.version || `v${new Date().toISOString().slice(0, 10)}`;
      const versionEntry = {
        version,
        pdfUrl: form.pdfUrl,
        note: `Saved from Resume Builder on ${new Date().toLocaleString()}`,
        updatedAt: new Date().toISOString(),
      };
      const existingVersions = Array.isArray(form.versions) ? form.versions : [];
      const data = {
        title: form.title,
        description: form.description,
        pdfUrl: form.pdfUrl,
        version,
        versions: [versionEntry, ...existingVersions.filter((item) => item.version !== version)].slice(0, 10),
        coreSkills: textToList(form.coreSkills),
        sections: {
          education: textToList(form.education),
          experience: textToList(form.experience),
          projects: textToList(form.projects),
          skills: textToList(form.skills),
          certifications: textToList(form.certifications),
          achievements: textToList(form.achievements),
        },
        ai: {
          generatorReady: true,
          reviewerReady: true,
          notes: form.aiNotes,
        },
      };
      setError("");
      setStatus("Saving resume...");
      await api("/resume", { method: "PUT", body: JSON.stringify({ data, isVisible: visible }) });
      setForm((current) => ({ ...current, versions: data.versions }));
      setStatus("Resume saved");
      window.setTimeout(() => setStatus(""), 1800);
    } catch (saveError) {
      setStatus("");
      setError(saveError.message);
    }
  };

  const uploadPdf = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    try {
      setUploading(true);
      setError("");
      setStatus("Uploading resume PDF...");
      const dataUrl = await readFile(file);
      const asset = await api("/media/upload", {
        method: "POST",
        body: JSON.stringify({
          title: file.name,
          fileName: file.name,
          mimeType: file.type,
          category: "resume",
          tags: ["resume", form.version || "current"],
          dataUrl,
        }),
      });
      update("pdfUrl", asset.url);
      setStatus("PDF uploaded. Save Resume to publish this version.");
    } catch (uploadError) {
      setStatus("");
      setError(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="admin-page">
      <PageHeading
        eyebrow="Resume system"
        title="Resume Builder"
        description="Manage the public resume PDF, preview, downloads, versions, and resume sections from one place."
        actions={<button className="primary-action" onClick={save}><FaFloppyDisk /> Save Resume</button>}
      />
      {error && <div className="admin-error">{error}</div>}
      {status && <div className="admin-success">{status}</div>}

      <div className="metric-grid">
        <article className="metric-card"><FaDownload /><span>Resume Downloads</span><strong>{resumeStats.downloads || 0}</strong></article>
        <article className="metric-card"><FaEye /><span>Completion</span><strong>{completion}%</strong></article>
        <article className="metric-card"><FaRobot /><span>AI Ready</span><strong>{form.aiNotes ? "Yes" : "Draft"}</strong></article>
      </div>

      <section className="admin-panel resume-builder-panel">
        <div className="form-grid two-columns">
          <label>Resume Title<input value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
          <label>Current Version<input value={form.version} onChange={(event) => update("version", event.target.value)} /></label>
          <label className="full-field">Description<textarea rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
          <label className="full-field">Resume PDF URL<input value={form.pdfUrl} onChange={(event) => update("pdfUrl", event.target.value)} placeholder="/Nagoor_Resume.pdf" /></label>
        </div>
        <div className="resume-actions-row">
          <label className="toggle"><input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} /><span /> Visible on portfolio</label>
          <a href={form.pdfUrl || "/Nagoor_Resume.pdf"} target="_blank" rel="noreferrer"><FaEye /> Preview</a>
          <a href={form.pdfUrl || "/Nagoor_Resume.pdf"} download><FaDownload /> Download</a>
          <label className="secondary-action file-action"><FaUpload /> {uploading ? "Uploading..." : "Upload PDF"}<input type="file" accept="application/pdf" onChange={uploadPdf} disabled={uploading} /></label>
          <a href="/media"><FaUpload /> Media Library</a>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-heading"><div><span>Resume sections</span><h2>Editable Resume Content</h2></div></div>
        <div className="form-grid two-columns resume-section-grid">
          {["education", "experience", "projects", "skills", "certifications", "achievements"].map((field) => (
            <label key={field}>{label(field)}<textarea rows={6} value={form[field]} onChange={(event) => update(field, event.target.value)} placeholder="One item per line" /></label>
          ))}
          <label className="full-field">Core Skills<textarea rows={4} value={form.coreSkills} onChange={(event) => update("coreSkills", event.target.value)} placeholder="Java, React, MongoDB..." /></label>
          <label className="full-field">AI Resume Notes<textarea rows={4} value={form.aiNotes} onChange={(event) => update("aiNotes", event.target.value)} placeholder="Career goal, preferred roles, strengths, ATS keywords..." /></label>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-heading"><div><span>Version history</span><h2>Resume Versions</h2></div></div>
        <div className="version-list">
          {form.versions?.length ? form.versions.map((item) => (
            <div key={`${item.version}-${item.updatedAt}`}><strong>{item.version}</strong><span>{item.pdfUrl}</span><small>{item.note}</small></div>
          )) : <p className="empty-state">No saved versions yet. Saving creates the first version record.</p>}
        </div>
      </section>
    </div>
  );
}

function textToList(value = "") {
  if (Array.isArray(value)) return value;
  return String(value).split("\n").map((item) => item.trim()).filter(Boolean);
}

function listToText(value = "") {
  if (Array.isArray(value)) return value.join("\n");
  return String(value || "");
}

function label(value = "") {
  return value.replace(/^./, (letter) => letter.toUpperCase());
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
