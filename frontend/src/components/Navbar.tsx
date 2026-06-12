import { Link, useNavigate } from "@tanstack/react-router";
import { Hammer, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const initials = user?.name?.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-40 border-b border-forge-border bg-[#0a0e1a]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-8 h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-forge-border bg-forge-elevated group-hover:border-forge-amber transition">
            <Hammer className="h-4 w-4 forge-amber-text" />
          </span>
          <span className="font-display font-bold text-lg tracking-tight">
            Link<span className="forge-amber-text">Forge</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="forge-btn-ghost h-10 px-4 text-sm">Login</Link>
              <Link to="/signup" className="forge-btn-primary h-10 px-4 text-sm">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-sm text-forge-muted hover:text-forge-text transition">
                Dashboard
              </Link>
              <div className="h-6 w-px bg-forge-border mx-1" />
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-forge-amber text-[#0a0e1a] text-xs font-bold forge-mono">
                  {initials}
                </span>
                <span className="text-sm text-forge-text hidden lg:inline">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="forge-btn-ghost h-10 px-3 text-sm" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </nav>

        <button className="md:hidden text-forge-text" onClick={() => setOpen(v => !v)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-forge-border bg-forge-surface px-5 py-4 space-y-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block forge-btn-ghost w-full">Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="block forge-btn-primary w-full">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2 text-forge-text">Dashboard</Link>
              <button onClick={() => { setOpen(false); handleLogout(); }} className="forge-btn-ghost w-full">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
