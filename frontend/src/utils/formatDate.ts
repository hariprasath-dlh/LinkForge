import { format, formatDistanceToNow } from "date-fns";

export const fmtDate = (iso: string) => format(new Date(iso), "MMM d, yyyy");
export const fmtDateTime = (iso: string) => format(new Date(iso), "MMM d, yyyy · HH:mm");
export const fmtRelative = (iso: string | null | undefined) =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : "Never";
export const isExpired = (iso?: string | null) =>
  !!iso && new Date(iso).getTime() < Date.now();
