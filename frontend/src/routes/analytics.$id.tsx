import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { ArrowLeft, MousePointerClick, Clock, Calendar, CircleDot } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getAnalytics, type AnalyticsData } from "../api/analytics.api";
import { getAllURLs, type ShortURL } from "../api/url.api";
import { fmtDate, fmtDateTime, fmtRelative, isExpired } from "../utils/formatDate";
import { shortUrlFor } from "../components/URLCard";

export const Route = createFileRoute("/analytics/$id")({
  head: () => ({
    meta: [
      { title: "Link Analytics — LinkForge" },
      { name: "description", content: "Detailed click analytics, browser & device breakdown, and visit history for your short link." },
    ],
  }),
  component: () => <ProtectedRoute><AnalyticsView /></ProtectedRoute>,
});

const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const EMERALD = "#10b981";
const PURPLE = "#8b5cf6";
const GRAY = "#6b7280";
const PALETTE = [AMBER, BLUE, EMERALD, PURPLE, GRAY];

function AnalyticsView() {
  const { id } = useParams({ from: "/analytics/$id" });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [url, setUrl] = useState<ShortURL | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, urls] = await Promise.all([getAnalytics(id), getAllURLs()]);
        setData(a);
        setUrl(urls.find(u => u.id === id) ?? null);
      } catch { toast.error("Could not load analytics"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <Loader />;
  if (!data || !url) return <NotFound />;

  const short = shortUrlFor(url.shortCode);
  const expired = isExpired(url.expiresAt);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 py-8 lg:py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-forge-muted hover:text-forge-amber transition">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs forge-mono text-forge-dim uppercase tracking-wider">// analytics</div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold truncate">Link Analytics</h1>
            <a href={url.originalUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block forge-mono text-lg forge-amber-text hover:underline truncate max-w-full">
              {short.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Stat icon={MousePointerClick} label="Total Clicks" value={String(data.totalClicks)} accent />
          <Stat icon={Clock} label="Last Visited" value={fmtRelative(data.lastVisited)} />
          <Stat icon={Calendar} label="Created" value={fmtDate(url.createdAt)} />
          <Stat
            icon={CircleDot}
            label="Status"
            value={expired ? "Expired" : "Active"}
            valueClass={expired ? "text-forge-expired" : "text-forge-success"}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          <ChartCard title="Daily Click Trends" subtitle="Last 30 days">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.dailyClicks} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#1e2d40" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(245,158,11,0.08)" }} />
                <Bar dataKey="clicks" fill={AMBER} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Browser Breakdown" subtitle="By click count">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.browsers} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {data.browsers.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#0a0e1a" strokeWidth={2} />)}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Space Grotesk" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-5 mt-5">
          <ChartCard title="Device Breakdown" subtitle="Mobile · Desktop · Tablet">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.devices} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {data.devices.map((_, i) => <Cell key={i} fill={[AMBER, BLUE, PURPLE][i % 3]} stroke="#0a0e1a" strokeWidth={2} />)}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Space Grotesk" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Trend Line" subtitle="Smoothed click velocity">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.dailyClicks} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#1e2d40" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <Tooltip content={<DarkTooltip />} />
                <Line type="monotone" dataKey="clicks" stroke={AMBER} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 5, fill: AMBER }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Visit table + QR */}
        <div className="grid lg:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2 forge-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-semibold">Recent Visits</h3>
                <p className="text-xs forge-mono text-forge-dim uppercase tracking-wider">Last {data.visits.length} entries</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs forge-mono uppercase tracking-wider text-forge-dim border-b border-forge-border">
                    <th className="py-2.5 pr-4">Time</th>
                    <th className="py-2.5 pr-4">Browser</th>
                    <th className="py-2.5 pr-4">Device</th>
                    <th className="py-2.5">OS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.visits.map((v, i) => (
                    <tr key={i} className="border-b border-forge-border/60 hover:bg-forge-elevated/50 transition">
                      <td className="py-2.5 pr-4 forge-mono text-forge-muted text-xs">{fmtDateTime(v.timestamp)}</td>
                      <td className="py-2.5 pr-4">{v.browser}</td>
                      <td className="py-2.5 pr-4 forge-mono text-xs">{v.device}</td>
                      <td className="py-2.5 forge-mono text-xs text-forge-muted">{v.os}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="forge-card p-5">
            <h3 className="font-display text-lg font-semibold">QR Code</h3>
            <p className="text-xs forge-mono text-forge-dim uppercase tracking-wider">Share this link</p>
            <div className="mt-4 bg-white rounded-md p-4 flex items-center justify-center">
              <QRCodeCanvas value={short} size={180} fgColor="#0a0e1a" />
            </div>
            <div className="mt-3 forge-mono text-xs forge-amber-text break-all text-center">
              {short.replace(/^https?:\/\//, "")}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner size={32} /></div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto text-center py-24 px-5">
        <h2 className="font-display text-2xl font-semibold">Analytics not found</h2>
        <p className="mt-2 text-forge-muted text-sm">This link may have been deleted.</p>
        <Link to="/dashboard" className="forge-btn-primary mt-6 inline-flex">Back to Dashboard</Link>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="forge-card p-5">
      <div className="mb-3">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-xs forge-mono text-forge-dim uppercase tracking-wider">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Stat({ icon: Icon, label, value, valueClass, accent }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; valueClass?: string; accent?: boolean;
}) {
  return (
    <div className={`forge-card p-5 ${accent ? "forge-glow-amber" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs forge-mono uppercase tracking-wider text-forge-dim">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "forge-amber-text" : "text-forge-muted"}`} />
      </div>
      <div className={`mt-3 forge-mono font-bold text-2xl ${valueClass || "text-forge-text"}`}>{value}</div>
    </div>
  );
}

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-forge-border bg-forge-elevated px-3 py-2 shadow-lg">
      {label && <div className="text-xs forge-mono text-forge-dim mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-forge-muted">{p.name}:</span>
          <span className="forge-mono font-semibold text-forge-text">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
