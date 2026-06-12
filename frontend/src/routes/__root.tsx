import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import appCss from "../styles.css?url";
import { AuthProvider } from "../context/AuthContext";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 forge-noise">
      <div className="text-center max-w-md">
        <div className="forge-mono text-[8rem] leading-none font-bold forge-amber-text">
          404
        </div>
        <h2 className="mt-2 text-xl font-semibold text-forge-text">
          This link doesn't exist or has expired.
        </h2>
        <p className="mt-2 text-sm text-forge-muted">
          The forge couldn't locate what you're looking for.
        </p>
        <Link to="/" className="forge-btn-primary mt-8 inline-flex">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-forge-text">Something broke in the forge</h1>
        <p className="mt-2 text-sm text-forge-muted">Try again or head back home.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="forge-btn-primary"
          >
            Try again
          </button>
          <a href="/" className="forge-btn-ghost">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LinkForge — Craft Short Links. Track Every Click." },
      {
        name: "description",
        content:
          "LinkForge gives you powerful short URLs with real-time analytics, QR codes, and deep insights. Built for developers, marketers, and creators.",
      },
      { property: "og:title", content: "LinkForge — Craft Short Links. Track Every Click." },
      { property: "og:description", content: "Powerful short URLs with real-time analytics, QR codes, and deep insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0a0e1a" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1c2333",
              color: "#f1f5f9",
              border: "1px solid #1e2d40",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "0.9rem",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#0a0e1a" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#0a0e1a" } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
