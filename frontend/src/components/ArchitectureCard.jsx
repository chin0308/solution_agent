import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar } from "lucide-react";

function ArchitectureCard({ architecture, onClick }) {
  const navigate = useNavigate();
  const id = architecture.id || architecture.run_id;
  
  const handleClick = () => {
    if (onClick) {
      onClick(architecture);
    } else if (id) {
      navigate(`/architecture/${id}`);
    }
  };

  const formattedDate = architecture.created_at
    ? new Date(architecture.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";

  const architectureStyle = architecture.architecture_style || architecture.architecture || "Unknown";
  const confidence = architecture.confidence || 0;
  const status = architecture.status || "Draft";

  const statusColors = {
    Draft: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <button
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 text-left w-full"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition">
              {architectureStyle}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              {architecture.requirements
                ? architecture.requirements.substring(0, 80) + (architecture.requirements.length > 80 ? "..." : "")
                : "No requirements provided"}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${statusColors[status]}`}>
            {status}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Calendar className="size-3" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="size-3" />
            {confidence}% confidence
          </div>
        </div>

        {/* Retrieval Stats */}
        {architecture.retrieval_stats && (
          <div className="text-xs text-zinc-400 border-t border-white/10 pt-3">
            {architecture.retrieval_stats.similar_found > 0 ? (
              <span className="text-emerald-400">
                ✓ Retrieved {architecture.retrieval_stats.similar_found} similar architectures
              </span>
            ) : (
              <span className="text-zinc-500">No similar architectures found</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

export default ArchitectureCard;
