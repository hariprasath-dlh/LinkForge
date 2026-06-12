/**
 * URL API — connected to real backend.
 *   GET    /api/urls
 *   POST   /api/urls
 *   PATCH  /api/urls/:id
 *   DELETE /api/urls/:id
 */
import { apiFetch, API_BASE_URL } from "./axios";

export interface ShortURL {
  id: string;
  originalUrl: string;
  shortCode: string;
  alias?: string;
  createdAt: string;
  expiresAt?: string | null;
  clicks: number;
  userId: string;
}

/** Map a backend URL document to the frontend ShortURL shape. */
function mapURL(raw: any): ShortURL {
  return {
    id: raw._id,
    originalUrl: raw.originalUrl,
    shortCode: raw.shortCode,
    alias: raw.customAlias || undefined,
    createdAt: raw.createdAt,
    expiresAt: raw.expiryDate || null,
    clicks: raw.totalClicks ?? 0,
    userId: raw.userId,
  };
}

export async function getAllURLs(): Promise<ShortURL[]> {
  const data = await apiFetch<{ success: boolean; urls: any[] }>("/api/urls");
  return data.urls.map(mapURL);
}

export async function createURL(
  originalUrl: string,
  alias?: string,
  expiresAt?: string | null,
): Promise<ShortURL> {
  const data = await apiFetch<{ success: boolean; url: any }>("/api/urls", {
    method: "POST",
    body: JSON.stringify({
      originalUrl,
      customAlias: alias || undefined,
      expiryDate: expiresAt || undefined,
    }),
  });
  return mapURL(data.url);
}

export async function deleteURL(id: string): Promise<void> {
  await apiFetch(`/api/urls/${id}`, { method: "DELETE" });
}

export async function editURL(id: string, newOriginalUrl: string): Promise<ShortURL> {
  const data = await apiFetch<{ success: boolean; url: any }>(`/api/urls/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ originalUrl: newOriginalUrl }),
  });
  return mapURL(data.url);
}

export async function getURLByCode(shortCode: string): Promise<ShortURL | null> {
  try {
    const data = await apiFetch<{ success: boolean; stats: any }>(`/api/stats/${shortCode}`);
    // stats endpoint returns limited data — construct a partial ShortURL
    return {
      id: "",
      originalUrl: "",
      shortCode: data.stats.shortCode,
      createdAt: data.stats.createdAt,
      clicks: data.stats.totalClicks ?? 0,
      userId: "",
    };
  } catch {
    return null;
  }
}
