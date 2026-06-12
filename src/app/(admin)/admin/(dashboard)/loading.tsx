export default function Loading() {
  return (
    <div className="flex items-center justify-center py-32" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-700" />
    </div>
  );
}
