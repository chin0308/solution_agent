import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Filter, Search, ShieldCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import architectureApi from "../services/architectureApi";

const statusOptions = ["All", "Draft", "Approved", "Rejected"];

function StatusPill({ status }) {
  const styles = {
    Draft: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] || styles.Draft}`}>
      {status || "Draft"}
    </span>
  );
}

function StatusManagementPage() {
  const navigate = useNavigate();
  const [architectures, setArchitectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const loadArchitectures = async () => {
      try {
        setLoading(true);
        const data = await architectureApi.getHistory(0, 1000);
        setArchitectures(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load architectures");
      } finally {
        setLoading(false);
      }
    };

    loadArchitectures();
  }, []);

  const filteredArchitectures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return architectures.filter((architecture) => {
      const matchesStatus = statusFilter === "All" || architecture.status === statusFilter;
      const searchSpace = [
        architecture.architecture_style,
        architecture.architecture,
        architecture.requirements,
        architecture.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || searchSpace.includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [architectures, searchQuery, statusFilter]);

  const counts = useMemo(() => ({
    total: architectures.length,
    approved: architectures.filter((architecture) => architecture.status === "Approved").length,
    draft: architectures.filter((architecture) => architecture.status === "Draft").length,
    rejected: architectures.filter((architecture) => architecture.status === "Rejected").length,
  }), [architectures]);

  async function handleStatusUpdate(id, nextStatus) {
    try {
      setUpdatingId(id);
      await architectureApi.updateArchitectureStatus(id, nextStatus);
      setArchitectures((current) =>
        current.map((architecture) =>
          architecture.id === id || architecture.run_id === id
            ? { ...architecture, status: nextStatus }
            : architecture
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-300">
            <ShieldCheck className="size-4" />
            Governance Dashboard
          </div>
          <h1 className="mt-4 text-4xl font-bold text-white">Status Management</h1>
          <p className="mt-2 max-w-3xl text-zinc-400">
            Review generated architectures, update governance status, and filter records without opening the studio.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total", value: counts.total, icon: Clock3, color: "cyan" },
            { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "emerald" },
            { label: "Draft", value: counts.draft, icon: AlertCircle, color: "amber" },
            { label: "Rejected", value: counts.rejected, icon: AlertCircle, color: "red" },
          ].map((item) => {
            const Icon = item.icon;
            const colorClasses = {
              cyan: "border-cyan-500/30 from-cyan-500/10 to-cyan-500/0 text-cyan-300",
              emerald: "border-emerald-500/30 from-emerald-500/10 to-emerald-500/0 text-emerald-300",
              amber: "border-amber-500/30 from-amber-500/10 to-amber-500/0 text-amber-300",
              red: "border-red-500/30 from-red-500/10 to-red-500/0 text-red-300",
            };

            return (
              <div key={item.label} className={`rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm ${colorClasses[item.color]}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-400">{item.label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{item.value}</p>
                  </div>
                  <Icon className={`size-7 ${colorClasses[item.color].split(" ").pop()}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <Search className="size-5 text-zinc-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by architecture, requirement, or status"
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <Filter className="size-5 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option} className="bg-zinc-900">
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            Loading architectures...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        ) : filteredArchitectures.length > 0 ? (
          <div className="space-y-4">
            {filteredArchitectures.map((architecture) => {
              const id = architecture.id ?? architecture.run_id;
              const confidence = architecture.confidence ?? 0;
              const retrievalHits = architecture.retrieval_stats?.similar_found ?? 0;

              return (
                <div key={id} className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 backdrop-blur-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">
                          {architecture.architecture_style || architecture.architecture || "Unknown Architecture"}
                        </h2>
                        <StatusPill status={architecture.status} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                        {architecture.requirements || "No requirements available"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                        <span>ID: {id}</span>
                        <span>Confidence: {confidence}%</span>
                        <span>Retrieval Hits: {retrievalHits}</span>
                        <span>
                          {architecture.created_at ? new Date(architecture.created_at).toLocaleString() : "Unknown date"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <select
                        value={architecture.status || "Draft"}
                        onChange={(event) => handleStatusUpdate(id, event.target.value)}
                        disabled={updatingId === id}
                        className="rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        onClick={() => navigate(`/architecture/${id}`)}
                        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            No architectures match the current filters.
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default StatusManagementPage;
