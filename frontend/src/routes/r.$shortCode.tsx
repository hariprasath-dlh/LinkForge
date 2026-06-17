import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { API_BASE_URL } from "../api/axios";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const Route = createFileRoute("/r/$shortCode")({
  component: RedirectPage,
});

function RedirectPage() {
  const { shortCode } = useParams({ from: "/r/$shortCode" });

  useEffect(() => {
    // Redirect to backend endpoint
    const backendUrl = `${API_BASE_URL.replace(/\/$/, "")}/r/${shortCode}`;
    window.location.replace(backendUrl);
  }, [shortCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center forge-noise">
      <div className="text-center">
        <LoadingSpinner size={40} />
        <h2 className="mt-6 text-xl font-semibold text-forge-text">Redirecting you...</h2>
        <p className="mt-2 text-sm text-forge-muted font-mono">/r/{shortCode}</p>
      </div>
    </div>
  );
}
