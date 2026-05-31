import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Database, Lock, Zap, Package, Network, BarChart3 } from "lucide-react";

function ArchitectureResult({ architecture }) {
  if (!architecture) return null;

  const architectureType = architecture.architecture_style || architecture.architecture || "Unknown";

  return (
    <div className="mt-10 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-cyan-300">Recommended Architecture</p>
            <h2 className="mt-2 text-4xl font-bold capitalize text-white">
              {architectureType.replace(/_/g, " ")}
            </h2>
          </div>
          <CheckCircle2 className="size-12 text-cyan-400" />
        </div>
      </div>

      {/* Reasoning */}
      <Card className="border-zinc-800 bg-zinc-900/70">
        <CardContent className="p-6">
          <h3 className="text-sm uppercase tracking-wide text-zinc-300">Reasoning</h3>
          <p className="mt-3 leading-relaxed text-zinc-200">{architecture.reasoning}</p>
        </CardContent>
      </Card>

      {/* Retrieval Matches */}
      <Card className="border-zinc-800 bg-zinc-900/70">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-emerald-400" />
            <h3 className="text-sm uppercase tracking-wide text-zinc-300">Retrieved Similar Architectures</h3>
          </div>

          <div className="mt-4 space-y-3">
            {Array.isArray(architecture.retrieved_architectures) && architecture.retrieved_architectures.length > 0 ? (
              architecture.retrieved_architectures.map((item, idx) => (
                <div key={`${item.style || item.name || idx}-${idx}`} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{item.style || item.name || `Architecture ${idx + 1}`}</p>
                      <p className="mt-1 text-sm text-zinc-400">{item.reasoning || item.summary || item.requirements || "No summary available."}</p>
                    </div>
                    <div className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {(Number(item.similarity || 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No similar architectures found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      {architecture.services && architecture.services.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Package className="size-5 text-cyan-400" />
            Recommended Services
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {architecture.services.map((service) => (
              <Card key={service.name} className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-4">
                  <p className="font-medium text-white">{service.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">{service.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {service.technology_stack?.map((tech) => (
                      <Badge key={tech} className="bg-zinc-700 text-zinc-100">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure */}
      {architecture.infrastructure && architecture.infrastructure.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Database className="size-5 text-blue-400" />
            Infrastructure Recommendations
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {architecture.infrastructure.map((item, idx) => {
              const key = typeof item === "string" ? item : (item.component || idx);
              const component = typeof item === "string" ? item : item.component;
              const technology = typeof item === "string" ? "" : item.technology;
              const rationale = typeof item === "string" ? "" : item.rationale;
              
              return (
                <Card key={key} className="border-zinc-800 bg-zinc-900/50">
                  <CardContent className="p-4">
                    <p className="font-medium text-white">{component}</p>
                    {technology && <p className="mt-1 text-xs text-zinc-400">{technology}</p>}
                    {rationale && <p className="mt-2 text-sm text-zinc-300">{rationale}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Integrations */}
      {architecture.integrations && architecture.integrations.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Network className="size-5 text-purple-400" />
            Integrations
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {architecture.integrations.map((integration) => (
              <Card key={integration} className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-200">{integration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      {architecture.security && architecture.security.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Lock className="size-5 text-red-400" />
            Security Recommendations
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {architecture.security.map((item) => (
              <Card key={item} className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-200">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scalability */}
      {architecture.scalability && architecture.scalability.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Zap className="size-5 text-yellow-400" />
            Scalability Strategy
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {architecture.scalability.map((item) => (
              <Card key={item} className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-200">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Event-Driven */}
      {architecture.event_driven_components && architecture.event_driven_components.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Event-Driven Components</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {architecture.event_driven_components.map((item) => (
              <Card key={item} className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-200">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Databases */}
      {architecture.databases && architecture.databases.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Database className="size-5 text-cyan-400" />
            Database Recommendations
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {architecture.databases.map((db) => (
              <Card key={db} className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-4">
                  <p className="text-sm text-zinc-200">{db}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArchitectureResult;
