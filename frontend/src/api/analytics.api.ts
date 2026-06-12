/**
 * Analytics API — connected to real backend.
 *   GET /api/analytics/:urlId
 *   GET /api/stats/:shortCode
 */
import { apiFetch } from "./axios";

export interface Visit {
  timestamp: string;
  browser: string;
  device: "Mobile" | "Desktop" | "Tablet";
  os: string;
}
export interface AnalyticsData {
  urlId: string;
  totalClicks: number;
  lastVisited: string | null;
  dailyClicks: { date: string; clicks: number }[];
  browsers: { name: string; value: number }[];
  devices: { name: string; value: number }[];
  visits: Visit[];
}
export interface PublicStats {
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
  lastVisited: string | null;
}

export async function getAnalytics(urlId: string): Promise<AnalyticsData> {
  const data = await apiFetch<{ success: boolean; analytics: any }>(`/api/analytics/${urlId}`);
  const a = data.analytics;

  // Map backend recentVisits to frontend Visit shape
  const visits: Visit[] = (a.recentVisits || []).map((v: any) => ({
    timestamp: v.visitedAt,
    browser: v.browser || "unknown",
    device: capitalizeDevice(v.device || "desktop"),
    os: v.os || "unknown",
  }));

  // Map backend dailyTrend to frontend dailyClicks shape
  // Backend sends full ISO dates (YYYY-MM-DD), frontend chart uses MM-DD
  const dailyClicks = (a.dailyTrend || []).map((d: any) => ({
    date: d.date.length > 5 ? d.date.slice(5) : d.date,
    clicks: d.clicks,
  }));

  return {
    urlId,
    totalClicks: a.totalClicks ?? 0,
    lastVisited: a.lastVisited || null,
    dailyClicks,
    browsers: a.browserBreakdown || [],
    devices: (a.deviceBreakdown || []).map((d: any) => ({
      name: capitalizeDevice(d.name),
      value: d.value,
    })),
    visits,
  };
}

/** Capitalize device names to match the frontend enum ("desktop" → "Desktop") */
function capitalizeDevice(d: string): "Mobile" | "Desktop" | "Tablet" {
  const lower = d.toLowerCase();
  if (lower === "mobile") return "Mobile";
  if (lower === "tablet") return "Tablet";
  return "Desktop";
}

export async function getPublicStats(shortCode: string): Promise<PublicStats | null> {
  try {
    const data = await apiFetch<{ success: boolean; stats: any }>(`/api/stats/${shortCode}`);
    const s = data.stats;
    return {
      shortCode: s.shortCode,
      originalUrl: s.originalUrl || "",
      totalClicks: s.totalClicks ?? 0,
      createdAt: s.createdAt,
      lastVisited: s.lastVisited || null,
    };
  } catch {
    return null;
  }
}
