/**
 * Centralized fetch wrapper for LinkForge backend API.
 *
 * Reads the base URL from VITE_API_BASE_URL and attaches the JWT
 * token stored under `linkforge_auth` in localStorage.
 */
type ViteImportMeta = ImportMeta & {
  env?: {
    DEV?: boolean;
    VITE_API_BASE_URL?: string;
  };
};

const viteEnv =
  typeof import.meta !== "undefined" ? (import.meta as ViteImportMeta).env : undefined;

const configuredApiBaseUrl = viteEnv?.VITE_API_BASE_URL;
const isDev = Boolean(viteEnv?.DEV);

export const API_BASE_URL = configuredApiBaseUrl || (isDev ? "http://localhost:5000" : "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required for production builds.");
}

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem("linkforge_auth");
    if (!raw) return null;
    return JSON.parse(raw).token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("linkforge_auth");
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    let msg: string;
    try {
      const body = await res.json();
      msg = body.message || res.statusText;
    } catch {
      msg = await res.text().catch(() => res.statusText);
    }
    throw new Error(msg || "Request failed");
  }
  return res.json() as Promise<T>;
}
