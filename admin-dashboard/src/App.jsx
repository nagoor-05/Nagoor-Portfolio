import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Logs from "./pages/Logs";
import SectionEditor from "./pages/SectionEditor";
import ItemManager from "./pages/ItemManager";
import SeoSettings from "./pages/SeoSettings";
import MediaManager from "./pages/MediaManager";
import ContactInbox from "./pages/ContactInbox";
import BlogManager from "./pages/BlogManager";
import CodingProfilesManager from "./pages/CodingProfilesManager";
import ResumeBuilder from "./pages/ResumeBuilder";

const sections = ["hero", "about", "contact", "landing", "stats", "github-profile", "site-settings"];
const collections = ["projects", "skills", "experience", "education", "certifications", "social-links"];

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="admin-loading">Loading admin...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={user ? <AdminLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="seo" element={<SeoSettings />} />
        <Route path="media" element={<MediaManager />} />
        <Route path="inbox" element={<ContactInbox />} />
        <Route path="resume-builder" element={<ResumeBuilder />} />
        <Route path="blog" element={<BlogManager />} />
        <Route path="coding-profiles" element={<CodingProfilesManager />} />
        <Route path="logs" element={<Logs />} />
        {sections.map((section) => (
          <Route key={section} path={`content/${section}`} element={<SectionEditor section={section} />} />
        ))}
        {collections.map((collection) => (
          <Route key={collection} path={`manage/${collection}`} element={<ItemManager collection={collection} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
