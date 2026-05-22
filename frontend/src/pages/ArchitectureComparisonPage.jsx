import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import architectureApi from "../services/architectureApi";
import { LoadingSpinner, ErrorBanner } from "../components/CommonUI";

function ComparisonView({ current, regenerated, label }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">{label}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Current Version */}
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 backdrop-blur-sm">
          <p className="text-xs text-cyan-300 mb-2">Current</p>
          {Array.isArray(current) ? (
            <ul className="space-y-2">
              {current.map((item, idx) => (
                <li key={idx} className="text-sm text-white truncate">
                  {typeof item === "string" ? item : item.name || item.component}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white">{current || "N/A"}</p>
          )}
        </div>

        {/* Regenerated Version */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-sm">
          <p className="text-xs text-emerald-300 mb-2">Regenerated</p>
          {Array.isArray(regenerated) ? (
            <ul className="space-y-2">
              {regenerated.map((item, idx) => (
                <li key={idx} className="text-sm text-white truncate">
                  {typeof item === "string" ? item : item.name || item.component}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white">{regenerated || "N/A"}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ArchitectureComparisonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [regenerated, setRegenerated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArchitecture = async () => {
      try {
        setLoading(true);
        const data = await architectureApi.getArchitectureById(id);
        setCurrent(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadArchitecture();
  }, [id]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const data = await architectureApi.regenerateArchitecture(id);
      setRegenerated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return (
    <AppLayout>
      <LoadingSpinner />
    </AppLayout>
  );

  if (error && !current) return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <button
          onClick={() => navigate("/history")}
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-6"
        >
          <ChevronLeft className="size-5" />
          Back
        </button>
        <ErrorBanner error={error} />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(`/architecture/${id}`)}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-6"
          >
            <ChevronLeft className="size-5" />
            Back to Detail
          </button>

          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Architecture Comparison</h1>
            <p className="text-zinc-400">
              Compare current and regenerated versions
            </p>
          </div>
        </div>

        {error && <ErrorBanner error={error} />}

        {/* Main Comparison */}
        {current && (
          <div className="space-y-8">
            {/* Confidence Comparison */}
            <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-4">AI Confidence</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center">
                  <p className="text-xs text-zinc-400 mb-2">Current</p>
                  <p className="text-5xl font-bold text-cyan-400">{current.confidence}%</p>
                </div>
                {regenerated && (
                  <div className="text-center">
                    <p className="text-xs text-zinc-400 mb-2">Regenerated</p>
                    <p className="text-5xl font-bold text-emerald-400">{regenerated.confidence}%</p>
                    <p className={`text-sm mt-2 ${regenerated.confidence > current.confidence ? "text-emerald-400" : "text-orange-400"}`}>
                      {regenerated.confidence > current.confidence ? "↑" : regenerated.confidence < current.confidence ? "↓" : "="} {Math.abs(regenerated.confidence - current.confidence)}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Architecture Type */}
            <ComparisonView
              current={current.architecture_style}
              regenerated={regenerated?.architecture_style}
              label="Architecture Type"
            />

            {/* Services */}
            <ComparisonView
              current={current.services || []}
              regenerated={regenerated?.services || []}
              label="Services"
            />

            {/* Infrastructure */}
            <ComparisonView
              current={current.infrastructure || []}
              regenerated={regenerated?.infrastructure || []}
              label="Infrastructure"
            />

            {/* Reasoning Comparison */}
            <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-4">Reasoning</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-cyan-300 mb-2">Current</p>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{current.reasoning}</p>
                </div>
                {regenerated && (
                  <div>
                    <p className="text-xs text-emerald-300 mb-2">Regenerated</p>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{regenerated.reasoning}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            {!regenerated && (
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:bg-zinc-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {regenerating ? (
                  <>
                    <Loader className="size-5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  "Generate Regenerated Version"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ArchitectureComparisonPage;
