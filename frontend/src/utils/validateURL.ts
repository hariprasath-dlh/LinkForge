export function isValidURL(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
}

export function isValidAlias(value: string): boolean {
  if (!value) return true;
  return /^[a-zA-Z0-9-]{3,30}$/.test(value);
}

export function isFutureDate(value: string): boolean {
  if (!value) return true;
  return new Date(value).getTime() > Date.now();
}
