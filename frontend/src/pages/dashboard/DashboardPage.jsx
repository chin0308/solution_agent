import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, Sparkles, ArrowRight } from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";
import RequirementTextarea from "../../components/upload/RequirementTextarea";
import architectureApi from "../../services/architectureApi";
import ArchitectureCard from "../../components/ArchitectureCard";
import SystemStatsCards from "../../components/SystemStatsCards";

function DashboardPage() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [recentArchitectures, setRecentArchitectures] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load recent architectures on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        setLoadingHistory(true);
        const data = await architectureApi.getHistory(0, 10);
        setRecentArchitectures(data);
      } catch (err) {
        console.error("Failed to load recent architectures:", err);
        setRecentArchitectures([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadRecent();
  }, []);

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      setError("Please enter requirements");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      // Call backend to generate architecture
      const result = await architectureApi.generateArchitecture(requirements);
      
      // Extract ID from response (backend should return it)
      // Use ?? (nullish coalescing) instead of || to handle 0 as a valid ID
      const architectureId = result.id ?? result.run_id;
      
      if (!architectureId && architectureId !== 0) {
        // Fallback: fetch latest architecture if no ID in response
        const history = await architectureApi.getHistory(0, 1);
        if (history.length > 0) {
          const fallbackId = history[0].id ?? history[0].run_id;
          navigate(`/architecture/${fallbackId}`);
        } else {
          setError("Architecture generated but could not retrieve ID");
        }
      } else {
        // Navigate directly to detail page with the generated architecture ID
        navigate(`/architecture/${architectureId}`);
      }
    } catch (err) {
      setError(err.message || "Failed to generate architecture");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300 border border-cyan-500/30">
            Enterprise Architecture Intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
            AI-Powered<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Architecture Studio
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Generate enterprise-grade solution architectures powered by AI reasoning, RAG retrieval, and governance workflows.
          </p>
        </div>

        {/* System Stats */}
        <div className="mb-12">
          <SystemStatsCards architectures={recentArchitectures} />
        </div>

        {/* Generation Form Section */}
        <div className="mb-12 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Generate New Architecture</h2>
            <p className="text-zinc-400">
              Describe your application requirements, constraints, and expected outcomes
            </p>
          </div>

          <RequirementTextarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            disabled={isGenerating}
            placeholder="Enter your architecture requirements, technology preferences, scalability needs, security constraints, and business objectives..."
          />

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!requirements.trim() || isGenerating}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-semibold text-white transition hover:from-cyan-400 hover:to-blue-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader className="size-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                Generate Architecture
              </>
            )}
          </button>
        </div>

        {/* Recent Architectures Section */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Recent Architectures</h2>
              <p className="text-zinc-400">
                View and manage your architecture history
              </p>
            </div>
            {recentArchitectures.length > 0 && (
              <button
                onClick={() => navigate("/history")}
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition font-medium"
              >
                View All
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>

          {loadingHistory ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative size-16">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-500/0 border-t-cyan-400" />
              </div>
            </div>
          ) : recentArchitectures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentArchitectures.slice(0, 6).map((arch) => (
                <ArchitectureCard key={arch.id || arch.run_id} architecture={arch} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-12 text-center backdrop-blur-sm">
              <Sparkles className="mx-auto size-12 text-zinc-500 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-400 mb-2">No architectures yet</h3>
              <p className="text-sm text-zinc-500">
                Generate your first architecture above to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;
