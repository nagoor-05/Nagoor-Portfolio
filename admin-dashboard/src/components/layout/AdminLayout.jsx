import { NavLink, Outlet } from "react-router-dom";
import {
  FaChartLine,
  FaFileLines,
  FaGaugeHigh,
  FaGlobe,
  FaImages,
  FaInbox,
  FaLayerGroup,
  FaNewspaper,
  FaRegFileLines,
  FaRightFromBracket,
  FaSliders,
  FaTerminal,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

const content = ["hero", "about", "contact", "landing", "stats", "github-profile", "site-settings"];
const manage = ["projects", "skills", "experience", "education", "certifications", "social-links"];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>N</span><div><strong>Nagoor</strong><small>Portfolio CMS</small></div></div>
        <nav>
          <NavLink to="/" end><FaGaugeHigh /> Dashboard</NavLink>
          <NavLink to="/analytics"><FaChartLine /> Analytics</NavLink>
          <NavLink to="/seo"><FaGlobe /> SEO Engine</NavLink>
          <NavLink to="/media"><FaImages /> Media Manager</NavLink>
          <NavLink to="/inbox"><FaInbox /> Contact Inbox</NavLink>
          <NavLink to="/resume-builder"><FaRegFileLines /> Resume Builder</NavLink>
          <NavLink to="/blog"><FaNewspaper /> Blog / Articles</NavLink>
          <NavLink to="/coding-profiles"><FaTerminal /> Coding Profiles</NavLink>
          <p>Content</p>
          {content.map((item) => <NavLink key={item} to={`/content/${item}`}><FaSliders /> {label(item)}</NavLink>)}
          <p>Collections</p>
          {manage.map((item) => <NavLink key={item} to={`/manage/${item}`}><FaLayerGroup /> {label(item)}</NavLink>)}
          <NavLink to="/logs"><FaFileLines /> Logs</NavLink>
        </nav>
      </aside>
      <section className="admin-workspace">
        <header className="admin-topbar">
          <div><strong>{user?.name}</strong><small>@{user?.username}</small></div>
          <button type="button" onClick={logout}><FaRightFromBracket /> Log out</button>
        </header>
        <main><Outlet /></main>
      </section>
    </div>
  );
}

function label(value) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
