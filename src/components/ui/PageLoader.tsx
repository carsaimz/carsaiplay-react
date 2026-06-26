export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-surface z-50 flex items-center justify-center">
      <div className="text-center">
        <span className="font-display text-4xl text-gradient tracking-widest animate-pulse">CARSAIPLAY</span>
        <div className="mt-4 flex justify-center gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
