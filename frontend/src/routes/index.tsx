import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Hammer, Link2, Zap, Copy, CheckCircle2 } from "lucide-react";
import { Navbar } from "../components/Navbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinkForge — Craft Short Links. Track Every Click." },
      { name: "description", content: "Powerful short URLs with real-time analytics, QR codes, and deep insights. Built for people who care about their links." },
      { property: "og:title", content: "LinkForge — Craft Short Links. Track Every Click." },
      { property: "og:description", content: "Powerful short URLs with real-time analytics, QR codes, and deep insights." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden forge-noise">
        <div className="absolute inset-0 forge-grid-bg opacity-50 pointer-events-none" />
        <div
          className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 60%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 60%)" }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36 grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT */}
          <div className="lg:col-span-7 forge-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-forge-border bg-forge-surface/60 px-3 py-1 text-xs forge-mono text-forge-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-forge-amber forge-pulse" />
              FORGE v1.0 — ONLINE
            </div>
            <h1 className="mt-6 font-display font-bold tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[1.02]">
              Craft Short Links.
              <br />
              <span className="forge-amber-text">Track Every Click.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-forge-muted leading-relaxed">
              LinkForge gives you powerful short URLs with real-time analytics, QR codes,
              and deep insights. Built for people who care about their links.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/signup" className="forge-btn-primary text-base px-6 py-3.5">
                Start Forging Free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="forge-btn-ghost text-base px-6 py-3.5">View Demo</a>
            </div>
            <div className="mt-10 flex items-center gap-4 text-xs forge-mono text-forge-dim uppercase tracking-wider">
              <span>Trusted by developers</span>
              <span className="h-px w-12 bg-forge-border" />
              <span>and creators worldwide</span>
            </div>
          </div>

          {/* RIGHT — floating mock card */}
          <div className="lg:col-span-5 forge-rise" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              <div
                className="absolute -inset-8 rounded-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle at 60% 40%, rgba(245,158,11,0.22), transparent 60%)" }}
              />
              <div className="relative forge-card p-6 forge-glow-amber">
                <div className="flex items-center justify-between text-xs forge-mono text-forge-dim uppercase">
                  <span>FORGED LINK</span>
                  <span className="text-forge-success">● ACTIVE</span>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-forge-dim mb-1">DESTINATION</div>
                  <div className="text-sm text-forge-muted truncate">https://docs.linkforge.dev/getting-started/v1/install-cli</div>
                </div>
                <div className="mt-4 rounded-md border border-forge-border bg-[#0a0e1a] px-3 py-3 flex items-center justify-between">
                  <span className="forge-mono text-forge-amber text-sm">lnkfg.dev/launch-day</span>
                  <Copy className="h-4 w-4 text-forge-muted" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { l: "CLICKS", v: "12.4K" },
                    { l: "TODAY", v: "847" },
                    { l: "CTR", v: "94%" },
                  ].map(s => (
                    <div key={s.l} className="rounded-md border border-forge-border bg-forge-elevated px-3 py-2.5">
                      <div className="text-[10px] forge-mono text-forge-dim">{s.l}</div>
                      <div className="forge-mono font-bold text-lg text-forge-text">{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-end gap-1.5 h-16">
                  {[30, 48, 35, 62, 50, 78, 92, 70, 88, 64, 95, 80].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i % 3 === 0 ? "#f59e0b" : "#1e2d40" }} />
                  ))}
                </div>
              </div>

              {/* floating chip */}
              <div className="absolute -bottom-4 -left-4 hidden sm:flex forge-card px-4 py-2.5 items-center gap-2 forge-glow-blue">
                <CheckCircle2 className="h-4 w-4 text-forge-success" />
                <span className="text-xs forge-mono text-forge-text">Copied to clipboard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative border-t border-forge-border bg-forge-surface/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
          <div className="max-w-2xl">
            <div className="text-xs forge-mono text-forge-dim uppercase tracking-wider">// the toolkit</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold">
              Built like a forge. Refined like an instrument.
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "Instant Shortening", desc: "Generate unique short links in milliseconds — no waiting, no queues." },
              { icon: BarChart3, title: "Deep Analytics", desc: "Track clicks, browsers, devices, and trends with real-time charts." },
              { icon: Link2, title: "Custom Aliases", desc: "Brand your links with custom names that match your campaigns." },
            ].map((f, i) => (
              <div key={i} className="forge-card forge-card-hover p-7 group">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-forge-border bg-forge-elevated group-hover:border-forge-amber transition">
                  <f.icon className="h-5 w-5 forge-amber-text" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-forge-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-forge-border">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-20 text-center">
          <h3 className="font-display text-3xl sm:text-4xl font-semibold">Ready to forge your first link?</h3>
          <p className="mt-3 text-forge-muted">Free to start. No credit card. Built for power users.</p>
          <Link to="/signup" className="forge-btn-primary mt-7 inline-flex px-6 py-3.5 text-base">
            Start Forging Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-forge-border bg-[#0a0e1a]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hammer className="h-4 w-4 forge-amber-text" />
            <span className="font-display font-bold">Link<span className="forge-amber-text">Forge</span></span>
            <span className="text-forge-dim text-sm ml-3">Craft Short Links. Track Every Click.</span>
          </div>
          <p className="text-xs forge-mono text-forge-dim text-center">
            This project is a part of a hackathon run by{" "}
            <a href="https://katomaran.com" target="_blank" rel="noreferrer" className="forge-amber-text hover:underline">
              katomaran.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
