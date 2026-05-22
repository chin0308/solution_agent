import { useNavigate } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 flex flex-col items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-7xl font-bold text-white mb-4">404</h1>
            <h2 className="text-3xl font-bold text-zinc-300 mb-2">Page Not Found</h2>
            <p className="text-zinc-400 mb-8">
              The architecture you're looking for doesn't exist or has been deleted.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-medium text-white hover:bg-cyan-400 transition"
          >
            <Home className="size-5" />
            Back to Dashboard
            <ArrowRight className="size-5" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default NotFoundPage;
