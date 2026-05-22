import { Link } from "react-router-dom";

function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur lg:px-8">
      <div>
        <p className="text-sm font-medium text-zinc-100">AI Insurance Architecture</p>
        <p className="text-xs text-zinc-400">Governance, risk, and delivery insights</p>
      </div>
      <Link
        to="/upload"
        className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
      >
        New Upload
      </Link>
    </header>
  );
}

export default Topbar;
