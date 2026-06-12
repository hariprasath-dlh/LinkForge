import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Hammer, MousePointerClick, Clock, Calendar, ArrowRight } from "lucide-react";
import { getPublicStats, type PublicStats } from "../api/analytics.api";
import { fmtDate, fmtRelative } from "../utils/formatDate";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const Route = createFileRoute("/stats/$shortCode")({
  head: () => ({
    meta: [
      { title: "Link Stats — LinkForge" },
      { name: "description", content: "Public link statistics powered by LinkForge." },
    ],
  }),
  component: PublicStatsPage,
});

function PublicStatsPage() {
  const { shortCode } = useParams({ from: "/stats/$shortCode" });
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getPublicStats(shortCode).then(setStats).finally(() => setLoading(false)); }, [shortCode]);

  return (
    <div className="min-h-screen flex flex-col forge-noise">
      <header className="border-b border-forge-border">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <Hammer className="h-5 w-5 forge-amber-text" />
            <span className="font-display font-bold">Link<span className="forge-amber-text">Forge</span></span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-xl forge-rise">
          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
          ) : !stats ? (
            <div className="forge-card p-10 text-center">
              <h2 className="font-display text-2xl font-semibold">Link not found</h2>
              <p className="mt-2 text-forge-muted">This short link doesn't exist or has been removed.</p>
              <Link to="/" className="forge-btn-primary mt-6 inline-flex">Go Home</Link>
            </div>
          ) : (
            <div className="forge-card p-8 forge-glow-amber">
              <div className="text-xs forge-mono uppercase tracking-wider text-forge-dim">// public stats</div>
              <h1 className="mt-2 font-display text-3xl font-semibold">Link Performance</h1>
              <div className="mt-3 forge-mono forge-amber-text text-lg break-all">/r/{stats.shortCode}</div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <PubStat icon={MousePointerClick} label="Clicks" value={String(stats.totalClicks)} />
                <PubStat icon={Calendar} label="Created" value={fmtDate(stats.createdAt)} />
                <PubStat icon={Clock} label="Last Visit" value={fmtRelative(stats.lastVisited)} />
              </div>

              <div className="mt-7 rounded-md border border-forge-border bg-forge-elevated p-4">
                <div className="text-xs forge-mono text-forge-dim uppercase tracking-wider">DESTINATION</div>
                <a href={stats.originalUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-forge-muted hover:text-forge-amber truncate">
                  {stats.originalUrl}
                </a>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-forge-muted text-sm">Create your own short links with LinkForge</p>
            <Link to="/signup" className="forge-btn-primary mt-3 inline-flex">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-forge-border py-6 text-center text-xs forge-mono text-forge-dim">
        Hackathon project by <a href="https://katomaran.com" className="forge-amber-text">katomaran.com</a>
      </footer>
    </div>
  );
}

function PubStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-md border border-forge-border bg-forge-elevated px-3 py-3 text-center">
      <Icon className="h-4 w-4 forge-amber-text mx-auto" />
      <div className="mt-2 forge-mono font-bold text-base text-forge-text truncate">{value}</div>
      <div className="text-[10px] forge-mono text-forge-dim uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
