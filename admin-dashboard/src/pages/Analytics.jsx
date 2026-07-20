import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../services/api";
import { PageHeading, label } from "./Dashboard";

const colors = ["#915eff", "#00cea8", "#48bcff", "#ff6fb1", "#ffd166", "#8cf6dd"];

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState({
    overview: {},
    traffic: [],
    weekly: [],
    monthly: [],
    pages: [],
    projects: [],
    referrers: [],
    devices: [],
    browsers: [],
    engagement: {},
  });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api("/analytics/overview"),
      api(`/analytics/traffic?days=${days}`),
      api(`/analytics/traffic/weekly?days=${Math.max(days, 90)}`),
      api("/analytics/traffic/monthly"),
      api("/analytics/pages"),
      api("/analytics/projects"),
      api("/analytics/referrers"),
      api("/analytics/devices"),
      api("/analytics/browsers"),
      api(`/analytics/engagement?days=${days}`),
    ]).then(([overview, traffic, weekly, monthly, pages, projects, referrers, devices, browsers, engagement]) =>
      setData({ overview, traffic, weekly, monthly, pages, projects, referrers, devices, browsers, engagement })
    )
      .catch((requestError) => setError(requestError.message));
  }, [days]);

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Visitor intelligence" title="Analytics" description="Understand what visitors view, click, download, and ask." actions={
        <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
          <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
        </select>
      } />
      {error && <div className="admin-error">{error}</div>}
      <div className="metric-grid">
        {Object.entries(data.overview).map(([key, value]) => <article className="metric-card" key={key}><span>{label(key)}</span><strong>{formatMetric(key, value)}</strong></article>)}
      </div>
      <div className="dashboard-grid">
        <ChartPanel title="Traffic trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.traffic}><CartesianGrid stroke="#26263a" vertical={false} /><XAxis dataKey="date" stroke="#8f94a8" /><YAxis stroke="#8f94a8" /><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="pageViews" stroke="#00cea8" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="visitors" stroke="#48bcff" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="events" stroke="#915eff" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Top pages">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.pages.slice(0, 8)} layout="vertical"><CartesianGrid stroke="#26263a" horizontal={false} /><XAxis type="number" stroke="#8f94a8" /><YAxis type="category" dataKey="_id" stroke="#8f94a8" width={80} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#915eff" radius={[0, 4, 4, 0]} /></BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Weekly traffic">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.weekly}><CartesianGrid stroke="#26263a" vertical={false} /><XAxis dataKey="period" stroke="#8f94a8" /><YAxis stroke="#8f94a8" /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="visitors" stroke="#00cea8" fill="#00cea833" strokeWidth={3} /></AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Monthly traffic">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.monthly}><CartesianGrid stroke="#26263a" vertical={false} /><XAxis dataKey="period" stroke="#8f94a8" /><YAxis stroke="#8f94a8" /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="pageViews" stroke="#915eff" fill="#915eff33" strokeWidth={3} /></AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
      <div className="dashboard-grid">
        <TablePanel title="Top project clicks" rows={data.projects} firstLabel="Project" secondLabel="Clicks" empty="No project clicks recorded yet." />
        <TablePanel title="Top referrers" rows={data.referrers} firstLabel="Referrer" secondLabel="Visits" empty="No referrers recorded yet." />
      </div>
      <div className="dashboard-grid">
        <DistributionPanel title="Device distribution" rows={data.devices} />
        <DistributionPanel title="Browser distribution" rows={data.browsers} />
      </div>
      <section className="admin-panel">
        <div className="panel-heading"><div><span>Engagement</span><h2>Scroll depth by page</h2></div><strong>{data.engagement.avgSessionDuration || 0}s avg session</strong></div>
        <div className="data-table analytics-table">
          <div className="table-row table-head"><span>Page</span><span>Average</span><span>Max</span></div>
          {data.engagement.scrollDepth?.length ? data.engagement.scrollDepth.map((item) => (
            <div className="table-row" key={item.page}><span>{item.page}</span><strong>{item.avgScrollDepth}%</strong><strong>{item.maxScrollDepth}%</strong></div>
          )) : <p className="empty-state">No scroll depth events recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}

function ChartPanel({ title, children }) {
  return <section className="admin-panel chart-panel"><div className="panel-heading"><div><span>Overview</span><h2>{title}</h2></div></div>{children}</section>;
}

const tooltipStyle = { background: "#11131d", border: "1px solid #34364b", borderRadius: 6 };

function TablePanel({ title, rows, firstLabel, secondLabel, empty }) {
  return (
    <section className="admin-panel">
      <div className="panel-heading"><div><span>Ranking</span><h2>{title}</h2></div></div>
      <div className="data-table">
        <div className="table-row table-head"><span>{firstLabel}</span><span>{secondLabel}</span></div>
        {rows.length ? rows.slice(0, 8).map((item) => <div className="table-row" key={item._id || "unknown"}><span>{item._id || "Direct / Unknown"}</span><strong>{item.count}</strong></div>) : <p className="empty-state">{empty}</p>}
      </div>
    </section>
  );
}

function DistributionPanel({ title, rows }) {
  return (
    <section className="admin-panel">
      <div className="panel-heading"><div><span>Distribution</span><h2>{title}</h2></div></div>
      <div className="distribution-panel">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={rows.slice(0, 6)} dataKey="count" nameKey="_id" innerRadius={58} outerRadius={90} paddingAngle={3}>
              {rows.slice(0, 6).map((item, index) => <Cell key={item._id || index} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="legend-list">
          {rows.slice(0, 6).map((item, index) => <div key={item._id || index}><i style={{ background: colors[index % colors.length] }} /> <span>{item._id || "Unknown"}</span><strong>{item.count}</strong></div>)}
        </div>
      </div>
    </section>
  );
}

function formatMetric(key, value) {
  if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("depth")) return `${value}%`;
  if (key.toLowerCase().includes("duration")) return `${value}s`;
  return value;
}
