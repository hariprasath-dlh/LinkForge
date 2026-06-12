import { useState } from "react";
import { Calendar, Hammer } from "lucide-react";
import toast from "react-hot-toast";
import { createURL } from "../api/url.api";
import { isFutureDate, isValidAlias, isValidURL } from "../utils/validateURL";
import { LoadingSpinner } from "./LoadingSpinner";

export function URLForm({ onCreated }: { onCreated: () => void }) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiry, setExpiry] = useState("");
  const [errors, setErrors] = useState<{ originalUrl?: string; alias?: string; expiry?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!originalUrl) e.originalUrl = "URL is required";
    else if (!isValidURL(originalUrl)) e.originalUrl = "Must be a valid http(s):// URL";
    if (!isValidAlias(alias)) e.alias = "3-30 chars, letters/numbers/hyphens only";
    if (expiry && !isFutureDate(expiry)) e.expiry = "Expiry must be in the future";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createURL(originalUrl, alias || undefined, expiry || null);
      toast.success("Link forged");
      setOriginalUrl(""); setAlias(""); setExpiry(""); setErrors({});
      onCreated();
    } catch (e: any) {
      toast.error(e.message || "Could not create link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label className="block text-xs forge-mono uppercase tracking-wider text-forge-muted">Destination URL</label>
        <input
          type="url"
          placeholder="https://example.com/very/long/path"
          value={originalUrl}
          onChange={e => setOriginalUrl(e.target.value)}
          onBlur={validate}
          className={`forge-input forge-input-focus ${errors.originalUrl ? "!border-forge-error" : ""}`}
        />
        {errors.originalUrl && <p className="text-xs text-forge-error forge-mono">{errors.originalUrl}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs forge-mono uppercase tracking-wider text-forge-muted">Custom Alias <span className="text-forge-dim normal-case">(optional)</span></label>
        <div className="flex items-center rounded-md border border-forge-border bg-forge-elevated overflow-hidden">
          <span className="px-3 text-sm forge-mono text-forge-dim border-r border-forge-border bg-[#0a0e1a]/40">lnkfg.dev/</span>
          <input
            value={alias}
            onChange={e => setAlias(e.target.value)}
            onBlur={validate}
            placeholder="my-brand-name"
            className={`flex-1 bg-transparent px-3 py-2.5 text-sm forge-mono text-forge-amber outline-none ${errors.alias ? "text-forge-error" : ""}`}
          />
        </div>
        {errors.alias && <p className="text-xs text-forge-error forge-mono">{errors.alias}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs forge-mono uppercase tracking-wider text-forge-muted">Expiry Date <span className="text-forge-dim normal-case">(optional)</span></label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forge-muted pointer-events-none" />
          <input
            type="datetime-local"
            value={expiry}
            onChange={e => setExpiry(e.target.value)}
            onBlur={validate}
            className={`forge-input forge-input-focus pl-10 ${errors.expiry ? "!border-forge-error" : ""}`}
          />
        </div>
        {errors.expiry && <p className="text-xs text-forge-error forge-mono">{errors.expiry}</p>}
      </div>

      <button type="submit" disabled={submitting} className="forge-btn-primary w-full py-3">
        {submitting ? (<><LoadingSpinner size={14} /> Forging...</>) : (<><Hammer className="h-4 w-4" /> Forge Link</>)}
      </button>
    </form>
  );
}
