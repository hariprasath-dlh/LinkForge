import { useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, X } from "lucide-react";
import toast from "react-hot-toast";
import type { ShortURL } from "../api/url.api";
import { shortUrlFor } from "./URLCard";

export function QRCodeModal({ url, onClose }: { url: ShortURL; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const short = shortUrlFor(url.shortCode);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const download = () => {
    const canvas = ref.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `linkforge-${url.shortCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR code downloaded");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm forge-rise" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="forge-card max-w-sm w-full p-6 forge-glow-amber" style={{ borderColor: "#f59e0b" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">QR Code</h3>
          <button onClick={onClose} className="text-forge-muted hover:text-forge-text" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div ref={ref} className="bg-white rounded-md p-5 flex items-center justify-center">
          <QRCodeCanvas value={short} size={220} bgColor="#ffffff" fgColor="#0a0e1a" level="M" includeMargin={false} />
        </div>
        <div className="mt-4 text-center forge-mono text-sm forge-amber-text break-all">
          {short.replace(/^https?:\/\//, "")}
        </div>
        <button onClick={download} className="forge-btn-primary w-full mt-5 py-2.5">
          <Download className="h-4 w-4" /> Download PNG
        </button>
      </div>
    </div>
  );
}
