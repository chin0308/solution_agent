import { Sparkles, Database, TrendingUp } from "lucide-react";

function SystemStatsCards({ architectures = [] }) {
  const stats = {
    totalGenerated: architectures.length,
    avgConfidence: 
      architectures.length > 0
        ? Math.round(architectures.reduce((sum, a) => sum + (a.confidence || 0), 0) / architectures.length)
        : 0,
    retrievalHits: architectures.reduce(
      (sum, a) => sum + ((a.retrieval_stats?.similar_found || 0) > 0 ? 1 : 0),
      0
    ),
  };

  const statCards = [
    {
      label: "Total Generated",
      value: stats.totalGenerated,
      icon: Database,
      color: "cyan",
    },
    {
      label: "Avg Confidence",
      value: `${stats.avgConfidence}%`,
      icon: Sparkles,
      color: "purple",
    },
    {
      label: "Retrieval Hits",
      value: stats.retrievalHits,
      icon: TrendingUp,
      color: "emerald",
    },
  ];

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        const colorClasses = {
          cyan: "from-cyan-500/20 to-cyan-500/0 border-cyan-500/30",
          purple: "from-purple-500/20 to-purple-500/0 border-purple-500/30",
          emerald: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30",
          amber: "from-amber-500/20 to-amber-500/0 border-amber-500/30",
        };

        const textClasses = {
          cyan: "text-cyan-400",
          purple: "text-purple-400",
          emerald: "text-emerald-400",
          amber: "text-amber-400",
        };

        return (
          <div
            key={idx}
            className={`rounded-lg border bg-gradient-to-br p-4 backdrop-blur-sm ${colorClasses[stat.color]}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <Icon className={`size-8 ${textClasses[stat.color]}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SystemStatsCards;
