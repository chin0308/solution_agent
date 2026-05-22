import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 text-white p-6">
      
      <h1 className="text-2xl font-bold">
        ValueMomentum
      </h1>

      <p className="text-zinc-400 text-sm mt-1">
        Architecture Agent
      </p>

      <nav className="mt-10 flex flex-col gap-4">

        <Link to="/" className="text-zinc-300 hover:text-white">
          Dashboard
        </Link>

        <Link to="/upload" className="text-zinc-300 hover:text-white">
          Upload
        </Link>

      </nav>

    </aside>
  );
}

export default Sidebar;