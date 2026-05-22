import { useState, useEffect } from "react";
import { Loader, Database, TrendingUp, Zap, CheckCircle, AlertCircle } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import architectureApi from "../services/architectureApi";
import { LoadingSpinner, ErrorBanner } from "../components/CommonUI";

function SystemOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const history = await architectureApi.getHistory(0, 1000);
        
        const totalGenerated = history.length;
        const totalRetrieval = history.reduce((sum, a) => sum + (a.retrieval_stats?.similar_found || 0), 0);
        const avgConfidence = history.length > 0
          ? Math.round(history.reduce((sum, a) => sum + (a.confidence || 0), 0) / history.length)
          : 0;

        const approvedCount = history.filter(a => a.status === "Approved").length;
        const draftCount = history.filter(a => a.status === "Draft").length;
        const rejectedCount = history.filter(a => a.status === "Rejected").length;

        setStats({
          totalGenerated,
          totalRetrieval,
          avgConfidence,
          approvedCount,
          draftCount,
          rejectedCount,
          recentActivity: history.slice(0, 5),
        });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return (
    <AppLayout>
      <LoadingSpinner />
    </AppLayout>
  );

  if (error) return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <ErrorBanner error={error} />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">System Overview</h1>
          <p className="text-zinc-400">
            Monitor architecture generation and system health
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {/* Total Generated */}
          <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Total Generated</h3>
              <Database className="size-6 text-cyan-400" />
            </div>
            <p className="text-4xl font-bold text-cyan-400">{stats.totalGenerated}</p>
            <p className="text-xs text-cyan-300 mt-2">architectures</p>
          </div>

          {/* Average Confidence */}
          <div className="rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Avg Confidence</h3>
              <TrendingUp className="size-6 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-purple-400">{stats.avgConfidence}%</p>
            <p className="text-xs text-purple-300 mt-2">AI confidence</p>
          </div>

          {/* RAG Retrieval */}
          <div className="rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">RAG Retrieval</h3>
              <Zap className="size-6 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-emerald-400">{stats.totalRetrieval}</p>
            <p className="text-xs text-emerald-300 mt-2">similar found</p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {/* Approved */}
          <div className="rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="size-5 text-emerald-400" />
              <h3 className="font-semibold text-white">Approved</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{stats.approvedCount}</p>
          </div>

          {/* Draft */}
          <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="size-5 text-amber-400" />
              <h3 className="font-semibold text-white">Draft</h3>
            </div>
            <p className="text-3xl font-bold text-amber-400">{stats.draftCount}</p>
          </div>

          {/* Rejected */}
          <div className="rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="size-5 text-red-400" />
              <h3 className="font-semibold text-white">Rejected</h3>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.rejectedCount}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((arch) => (
                <div key={arch.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:bg-white/5 transition">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{arch.architecture_style}</p>
                    <p className="text-xs text-zinc-500">{arch.created_at}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-cyan-400">{arch.confidence}%</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      arch.status === "Approved" ? "bg-emerald-500/20 text-emerald-300" :
                      arch.status === "Draft" ? "bg-amber-500/20 text-amber-300" :
                      "bg-red-500/20 text-red-300"
                    }`}>
                      {arch.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default SystemOverviewPage;
