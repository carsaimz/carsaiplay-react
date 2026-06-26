export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton rounded-lg aspect-[2/3] w-full" />
      <div className="mt-2 space-y-1.5">
        <div className="skeleton h-3.5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return <div className="skeleton w-full h-[60vh] rounded-none" />;
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
