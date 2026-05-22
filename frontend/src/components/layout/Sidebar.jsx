import { Link, useLocation } from "react-router-dom";
import {
  Zap,
  FileText,
  CheckCircle2,
  BookOpen,
  Settings,
  Brain,
  History,
  BarChart3,
} from "lucide-react";

const navSections = [
  {
    title: "Workspace",
    items: [
      { to: "/", icon: Zap, label: "Architecture Studio", badge: null },
      { to: "/system-overview", icon: BarChart3, label: "System Overview", badge: null },
    ],
  },
  {
    title: "Solutions",
    items: [
      { to: "/history", icon: History, label: "Architecture History", badge: null },
    ],
  },
  {
    title: "Governance",
    items: [
      { to: "/", icon: CheckCircle2, label: "Status Management", badge: null },
    ],
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-950/80 p-6 text-zinc-100 lg:block backdrop-blur-sm">
      {/* Header */}
      <Link
        to="/"
        className="group block rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/10"
      >
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-2">
            <Brain className="size-5 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-cyan-400">AI Architecture</p>
            <h1 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
              Workspace
            </h1>
          </div>
        </div>
      </Link>

      {/* Navigation Sections */}
      <nav className="mt-8 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              {section.title}
            </p>
            <ul className="mt-3 space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-3 backdrop-blur-sm">
          <p className="text-xs text-zinc-400">
            💡 <span className="text-cyan-300">Tip:</span> Upload requirements to generate AI-powered architectures.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
