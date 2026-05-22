import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";;
import architectureApi from "../services/architectureApi";
import ArchitectureCard from "../components/ArchitectureCard";

function ArchitectureHistoryPage() {
  const navigate = useNavigate();
  const [architectures, setArchitectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const limit = 50;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await architectureApi.getHistory(skip, limit);
        setArchitectures(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setArchitectures([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [skip]);

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-6"
          >
            <ChevronLeft className="size-5" />
            Back to Dashboard
          </button>

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Architecture History</h1>
            <p className="text-zinc-400">
              Browse and manage all generated architectures
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative size-16">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-500/0 border-t-cyan-400" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            Error loading history: {error}
          </div>
        ) : architectures.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              {architectures.map((arch) => (
                <ArchitectureCard key={arch.id || arch.run_id} architecture={arch} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:text-zinc-500 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="flex items-center text-zinc-400">
                Page {Math.floor(skip / limit) + 1}
              </span>
              <button
                onClick={() => setSkip(skip + limit)}
                disabled={architectures.length < limit}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:text-zinc-500 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-12 text-center backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-zinc-400 mb-2">No architectures found</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Generate your first architecture to get started
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2 font-medium text-white hover:bg-cyan-400 transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ArchitectureHistoryPage;
