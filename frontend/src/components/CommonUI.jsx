import { AlertCircle, Loader, CheckCircle, Info } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative size-16">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-500/0 border-t-cyan-400" />
      </div>
    </div>
  );
}

export function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
      <AlertCircle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-300">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 transition flex-shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-12 text-center backdrop-blur-sm">
      {Icon && <Icon className="mx-auto size-12 text-zinc-500 mb-4" />}
      <h3 className="text-lg font-semibold text-zinc-400 mb-2">{title}</h3>
      {description && <p className="text-sm text-zinc-500 mb-6">{description}</p>}
      {action && action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const colors = {
    Draft: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-medium ${colors[status] || colors.Draft}`}>
      {status}
    </span>
  );
}

export function RetrievalInsights({ stats }) {
  if (!stats) return null;
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <CheckCircle className="size-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-emerald-300">RAG Intelligence</p>
          <p className="text-xs text-emerald-200 mt-1">
            Retrieved <span className="font-semibold">{stats.similar_found}</span> similar architectures from {stats.retrieval_source}
          </p>
        </div>
      </div>
    </div>
  );
}

export function InfoBanner({ children }) {
  return (
    <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 flex items-start gap-3">
      <Info className="size-5 text-cyan-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-cyan-300">{children}</p>
    </div>
  );
}
