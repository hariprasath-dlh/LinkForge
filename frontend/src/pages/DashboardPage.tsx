import { useEffect, useMemo, useState } from "react";
import { Hammer, Link2, MousePointerClick, Calendar, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { Navbar } from "../components/Navbar";
import { URLForm } from "../components/URLForm";
import { URLCard } from "../components/URLCard";
import { QRCodeModal } from "../components/QRCodeModal";
import { getAllURLs, type ShortURL } from "../api/url.api";

export function DashboardPage() {
  const [urls, setUrls] = useState<ShortURL[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState<ShortURL | null>(null);

  const refresh = async () => {
    setLoading(true);
    try { setUrls(await getAllURLs()); }
    catch { toast.error("Could not load links"); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const stats = useMemo(() => {
    const totalClicks = urls.reduce((s, u) => s + u.clicks, 0);
    const thisMonth = urls.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length;
    const top = urls.reduce<ShortURL | null>((m, u) => (!m || u.clicks > m.clicks ? u : m), null);
    return { total: urls.length, totalClicks, thisMonth, top };
  }, [urls]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 sm:px-8 py-8 lg:py-10">
        {/* Title */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs forge-mono text-forge-dim uppercase tracking-wider">// command center</div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold">Your Forged Links</h1>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Link2} label="Total Links" value={String(stats.total)} />
          <StatCard icon={MousePointerClick} label="Total Clicks" value={String(stats.totalClicks)} accent />
          <StatCard icon={Calendar} label="This Month" value={String(stats.thisMonth)} />
          <StatCard
            icon={TrendingUp}
            label="Most Clicked"
            value={stats.top ? `${stats.top.clicks}` : "—"}
            sub={stats.top ? `/${stats.top.shortCode}` : "no links yet"}
          />
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Form */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="forge-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Hammer className="h-4 w-4 forge-amber-text" />
                  <h2 className="font-display text-lg font-semibold">Forge a New Link</h2>
                </div>
                <URLForm onCreated={refresh} />
              </div>
            </div>
          </aside>

          {/* List */}
          <section className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recent Links</h2>
              <span className="text-xs forge-mono text-forge-dim">{urls.length} TOTAL</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => <div key={i} className="forge-skeleton h-32" />)}
              </div>
            ) : urls.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {urls.map(u => (
                  <URLCard key={u.id} url={u} onChanged={refresh} onShowQR={setQrUrl} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {qrUrl && <QRCodeModal url={qrUrl} onClose={() => setQrUrl(null)} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`forge-card p-5 relative overflow-hidden ${accent ? "forge-glow-amber" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs forge-mono uppercase tracking-wider text-forge-dim">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "forge-amber-text" : "text-forge-muted"}`} />
      </div>
      <div className="mt-3 forge-mono font-bold text-3xl text-forge-text">{value}</div>
      {sub && <div className="mt-1 forge-mono text-xs text-forge-dim truncate">{sub}</div>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="forge-card p-12 text-center forge-noise">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-forge-border bg-forge-elevated">
        <Hammer className="h-7 w-7 forge-amber-text" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold">No links forged yet</h3>
      <p className="mt-2 text-sm text-forge-muted">Create your first short link using the form on the left.</p>
    </div>
  );
}
