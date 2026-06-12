import { Link } from "@tanstack/react-router";
import { Hammer, Zap, BarChart3, Link2 } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-forge-border bg-forge-surface forge-noise">
        <div className="absolute inset-0 forge-grid-bg opacity-40 pointer-events-none" />
        <div
          className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.22), transparent 60%)" }}
        />
        <Link to="/" className="relative flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-forge-border bg-forge-elevated">
            <Hammer className="h-4 w-4 forge-amber-text" />
          </span>
          <span className="font-display font-bold text-lg">Link<span className="forge-amber-text">Forge</span></span>
        </Link>

        <div className="relative max-w-md">
          <div className="text-xs forge-mono text-forge-dim uppercase tracking-wider">// the forge</div>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
            Craft Short Links.<br /><span className="forge-amber-text">Track Every Click.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Zap, t: "Instant shortening in milliseconds" },
              { icon: BarChart3, t: "Real-time analytics & insights" },
              { icon: Link2, t: "Custom aliases for your brand" },
            ].map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-forge-muted">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-forge-border bg-forge-elevated">
                  <b.icon className="h-4 w-4 forge-amber-text" />
                </span>
                <span className="text-sm">{b.t}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs forge-mono text-forge-dim">
          Hackathon project by <a href="https://katomaran.com" className="forge-amber-text">katomaran.com</a>
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-forge-bg">
        <div className="w-full max-w-md forge-rise">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <Hammer className="h-5 w-5 forge-amber-text" />
            <span className="font-display font-bold text-lg">Link<span className="forge-amber-text">Forge</span></span>
          </Link>
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-forge-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
