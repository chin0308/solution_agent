import { Textarea } from "@/components/ui/textarea";

function RequirementTextarea({
  value,
  onChange,
  disabled = false,
  placeholder = "Paste business, compliance, API, and non-functional requirements...",
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="text-sm font-medium text-zinc-200">Requirement Narrative</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Provide architecture context, constraints, integrations, and expected outcomes.
      </p>
      <Textarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="mt-4 min-h-56 border-zinc-700 bg-zinc-950/70 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30"
      />
    </section>
  );
}

export default RequirementTextarea;
