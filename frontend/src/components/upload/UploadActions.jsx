import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function UploadActions({
  onGenerate,
  onClear,
  isGenerating = false,
  disabled = false,
  canClear = true,
}) {
  const isGenerateDisabled = disabled || isGenerating;
  const isClearDisabled = disabled || isGenerating || !canClear;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="text-sm font-medium text-zinc-200">Actions</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Validate inputs and generate an AI-driven target architecture output.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={onGenerate}
          disabled={isGenerateDisabled}
          className="h-9 bg-cyan-500 text-zinc-950 hover:bg-cyan-400 disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {isGenerating ? "Generating..." : "Generate Architecture"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={isClearDisabled}
          className="h-9 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
        >
          <Trash2 />
          Clear
        </Button>
      </div>
    </section>
  );
}

export default UploadActions;
