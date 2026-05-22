function ArchitectureResult({ result }) {
  if (!result) return null;

  return (
    <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-white">

      <h2 className="text-3xl font-bold">
        {result.architecture_style}
      </h2>

      <p className="text-zinc-400 mt-4">
        {result.reasoning}
      </p>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">
          Suggested Services
        </h3>

        <div className="flex flex-wrap gap-3">
          {result.services.map((service) => (
            <div
              key={service}
              className="bg-zinc-800 px-4 py-2 rounded-lg"
            >
              {service}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default ArchitectureResult;