import { useState, useEffect } from "react";
import { Database, TrendingUp, Zap, CheckCircle, AlertCircle } from "lucide-react";
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
        const avgConfidence = totalGenerated > 0
          ? Math.round(
              history.reduce((sum, arch) => sum + (Number(arch.confidence) || 0), 0) /
              totalGenerated
            )
          : 0;

        const retrievalHits = history.reduce(
          (sum, arch) => sum + ((arch.retrieval_stats?.similar_found || 0) > 0 ? 1 : 0),
          0
        );

        const approvedCount = history.filter((arch) => arch.status === "Approved").length;
        const draftCount = history.filter((arch) => arch.status === "Draft").length;
        const rejectedCount = history.filter((arch) => arch.status === "Rejected").length;

        setStats({
          totalGenerated,
          avgConfidence,
          retrievalHits,
          approvedCount,
          draftCount,
          rejectedCount,
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
              <h3 className="font-semibold text-white">Retrieval Hits</h3>
              <Zap className="size-6 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-emerald-400">{stats.retrievalHits}</p>
            <p className="text-xs text-emerald-300 mt-2">architectures with matches</p>
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
      </div>
    </AppLayout>
  );
}

export default SystemOverviewPage;
