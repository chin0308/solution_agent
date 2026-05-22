import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Loader,
  Sparkles,
  TrendingUp,
  Database,
  Zap,
  Download,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";;
import architectureApi from "../services/architectureApi";

function ArchitectureDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [architecture, setArchitecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Draft");
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    services: true,
    infrastructure: true,
    rag: true,
  });

  useEffect(() => {
    const loadArchitecture = async () => {
      try {
        setLoading(true);
        const data = await architectureApi.getArchitectureById(id);
        setArchitecture(data);
        setStatus(data.status || "Draft");
        setError(null);
      } catch (err) {
        setError(err.message);
        setArchitecture(null);
      } finally {
        setLoading(false);
      }
    };

    loadArchitecture();
  }, [id]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await architectureApi.updateArchitectureStatus(id, newStatus);
      setStatus(newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleRegenerate = async () => {
    try {
      await architectureApi.regenerateArchitecture(id);
      navigate("/history");
    } catch (err) {
      console.error("Failed to regenerate:", err);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20">
          <div className="relative size-16">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-500/0 border-t-cyan-400" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !architecture) {
    return (
      <AppLayout>
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
          <button
            onClick={() => navigate("/history")}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-6"
          >
            <ChevronLeft className="size-5" />
            Back to History
          </button>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error || "Architecture not found"}
          </div>
        </div>
      </AppLayout>
    );
  }

  const statusColors = {
    Draft: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  const CollapsibleSection = ({ title, icon: Icon, children }) => {
    const isExpanded = expandedSections[title.toLowerCase()];
    return (
      <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 overflow-hidden backdrop-blur-sm">
        <button
          onClick={() => toggleSection(title.toLowerCase())}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <Icon className="size-5 text-cyan-400" />
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          <span className={`text-cyan-400 transition ${isExpanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
        {isExpanded && (
          <div className="border-t border-white/10 p-4 text-zinc-300">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/history")}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-6"
          >
            <ChevronLeft className="size-5" />
            Back to History
          </button>

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {architecture.architecture_style || architecture.architecture}
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                {architecture.requirements && architecture.requirements.substring(0, 120)}
                {architecture.requirements && architecture.requirements.length > 120 ? "..." : ""}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${statusColors[status]}`}>
              {status}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-zinc-400 mb-1">Confidence Score</p>
              <p className="text-2xl font-bold text-cyan-400">{architecture.confidence}%</p>
            </div>
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-zinc-400 mb-1">Generated</p>
              <p className="text-sm text-purple-300">
                {architecture.created_at
                  ? new Date(architecture.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-zinc-400 mb-1">Status</p>
              <select
                value={status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="bg-emerald-500/20 text-emerald-300 rounded px-2 py-1 text-sm border border-emerald-500/30"
              >
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4 mb-8">
          {/* Overview Section */}
          <CollapsibleSection title="Overview" icon={Sparkles}>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Architecture Type</h4>
                <p className="text-sm text-zinc-300">
                  {architecture.architecture_style || architecture.architecture}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Reasoning</h4>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                  {architecture.reasoning}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Services Section */}
          {architecture.services && architecture.services.length > 0 && (
            <CollapsibleSection title="Services" icon={Database}>
              <div className="space-y-3">
                {architecture.services.map((service, idx) => (
                  <div key={idx} className="border-l-2 border-cyan-500 pl-4">
                    <h5 className="font-semibold text-white">
                      {typeof service === "string" ? service : service.name}
                    </h5>
                    {typeof service === "object" && service.description && (
                      <p className="text-xs text-zinc-400 mt-1">
                        {service.description}
                      </p>
                    )}
                    {typeof service === "object" && service.technology_stack && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {service.technology_stack.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Infrastructure Section */}
          {architecture.infrastructure && architecture.infrastructure.length > 0 && (
            <CollapsibleSection title="Infrastructure" icon={TrendingUp}>
              <div className="space-y-3">
                {architecture.infrastructure.map((infra, idx) => (
                  <div key={idx} className="border-l-2 border-purple-500 pl-4">
                    <h5 className="font-semibold text-white">
                      {typeof infra === "string" ? infra : infra.component}
                    </h5>
                    {typeof infra === "object" && infra.technology && (
                      <p className="text-xs text-purple-300 mt-1">
                        {infra.technology}
                      </p>
                    )}
                    {typeof infra === "object" && infra.rationale && (
                      <p className="text-xs text-zinc-400 mt-1">
                        {infra.rationale}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* RAG Stats Section */}
          {architecture.retrieval_stats && (
            <CollapsibleSection title="RAG Intelligence" icon={Zap}>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white mb-2">Retrieval Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-zinc-300">
                      <span className="text-cyan-400 font-medium">
                        {architecture.retrieval_stats.similar_found}
                      </span>{" "}
                      similar architectures retrieved
                    </p>
                    <p className="text-zinc-300">
                      <span className="text-emerald-400 font-medium">
                        {architecture.retrieval_stats.retrieval_source}
                      </span>{" "}
                      source
                    </p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 italic">
                  This architecture was generated with context from similar architectures in the vector database,
                  enabling better reasoning and reduced hallucination.
                </p>
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={handleRegenerate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            <Zap className="size-5" />
            Regenerate
          </button>
          <button
            onClick={() => navigate(`/architecture/${id}/compare`)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500"
          >
            ⚖️ Compare
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
            <Download className="size-5" />
            Export
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default ArchitectureDetailPage;
