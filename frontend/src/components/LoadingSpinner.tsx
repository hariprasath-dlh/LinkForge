export function LoadingSpinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block forge-pulse rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle, #f59e0b 30%, rgba(245,158,11,0.15) 70%, transparent 100%)",
      }}
      aria-label="Loading"
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size={32} />
    </div>
  );
}
