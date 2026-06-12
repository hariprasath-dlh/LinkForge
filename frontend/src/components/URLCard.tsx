import { Link } from "@tanstack/react-router";
import { BarChart3, Check, Copy, Edit2, MousePointerClick, QrCode, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteURL, editURL, type ShortURL } from "../api/url.api";
import { fmtDate, isExpired } from "../utils/formatDate";
import { isValidURL } from "../utils/validateURL";

export function shortUrlFor(code: string) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/r/${code}`;
}

export function URLCard({ url, onChanged, onShowQR }: {
  url: ShortURL; onChanged: () => void; onShowQR: (u: ShortURL) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(url.originalUrl);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const expired = isExpired(url.expiresAt);
  const short = shortUrlFor(url.shortCode);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(short);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("Copy failed"); }
  };

  const saveEdit = async () => {
    if (!isValidURL(editVal)) { setEditErr("Must be a valid http(s):// URL"); return; }
    try {
      await editURL(url.id, editVal);
      toast.success("Link updated");
      setEditing(false); setEditErr(null);
      onChanged();
    } catch (e: any) { toast.error(e.message || "Update failed"); }
  };

  const doDelete = async () => {
    try {
      await deleteURL(url.id);
      toast.success("Link deleted");
      onChanged();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <article className={`forge-card forge-card-hover p-5 ${expired ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] forge-mono uppercase tracking-wider text-forge-dim">DESTINATION</span>
            {expired && (
              <span className="text-[10px] forge-mono px-1.5 py-0.5 rounded border border-forge-expired text-forge-expired uppercase">Expired</span>
            )}
          </div>
          {editing ? (
            <div className="space-y-2">
              <input
                className={`forge-input forge-input-focus text-sm ${editErr ? "!border-forge-error" : ""}`}
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
              />
              {editErr && <p className="text-xs text-forge-error forge-mono">{editErr}</p>}
              <div className="flex gap-2">
                <button onClick={saveEdit} className="forge-btn-primary py-1.5 px-3 text-xs"><Check className="h-3.5 w-3.5" /> Save</button>
                <button onClick={() => { setEditing(false); setEditVal(url.originalUrl); setEditErr(null); }} className="forge-btn-ghost py-1.5 px-3 text-xs"><X className="h-3.5 w-3.5" /> Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-forge-muted truncate" title={url.originalUrl}>{url.originalUrl}</p>
          )}
        </div>
      </div>

      <a
        href={url.originalUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block forge-mono text-forge-amber text-sm sm:text-base hover:underline truncate"
      >
        {short.replace(/^https?:\/\//, "")}
      </a>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 text-xs forge-mono text-forge-dim">
          <span>CREATED {fmtDate(url.createdAt).toUpperCase()}</span>
          <span className="inline-flex items-center gap-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span className="text-forge-text font-semibold">{url.clicks}</span> clicks
          </span>
          {url.expiresAt && !expired && (
            <span>EXP {fmtDate(url.expiresAt).toUpperCase()}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconBtn onClick={copy} title="Copy short URL">
            {copied ? <Check className="h-4 w-4 text-forge-success" /> : <Copy className="h-4 w-4" />}
          </IconBtn>
          <Link to="/analytics/$id" params={{ id: url.id }} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-forge-border bg-forge-elevated text-forge-muted hover:text-forge-amber hover:border-forge-amber transition" title="Analytics">
            <BarChart3 className="h-4 w-4" />
          </Link>
          <IconBtn onClick={() => onShowQR(url)} title="QR Code"><QrCode className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setEditing(v => !v)} title="Edit destination"><Edit2 className="h-4 w-4" /></IconBtn>
          {confirmDel ? (
            <>
              <button onClick={doDelete} className="forge-btn-primary !bg-forge-error !border-forge-error py-1.5 px-3 text-xs">Delete</button>
              <button onClick={() => setConfirmDel(false)} className="forge-btn-ghost py-1.5 px-3 text-xs">Cancel</button>
            </>
          ) : (
            <IconBtn onClick={() => setConfirmDel(true)} title="Delete" danger><Trash2 className="h-4 w-4" /></IconBtn>
          )}
        </div>
      </div>
    </article>
  );
}

function IconBtn({ children, onClick, title, danger }: {
  children: React.ReactNode; onClick?: () => void; title: string; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-forge-border bg-forge-elevated text-forge-muted transition
        hover:border-forge-amber hover:text-forge-amber
        ${danger ? "hover:!border-forge-error hover:!text-forge-error" : ""}`}
    >
      {children}
    </button>
  );
}
