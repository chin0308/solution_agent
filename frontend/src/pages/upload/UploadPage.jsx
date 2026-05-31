import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, AlertCircle } from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";
import UploadDropzone from "../../components/upload/UploadDropzone";
import RequirementTextarea from "../../components/upload/RequirementTextarea";
import UploadActions from "../../components/upload/UploadActions";
import ArchitectureResult from "../../components/architecture/ArchitectureResult";
import architectureApi from "../../services/architectureApi";

function UploadPage() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [requirements, setRequirements] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFilesSelected({ acceptedFiles, rejectedFiles: invalidFiles }) {
    setUploadedFiles((currentFiles) => [...currentFiles, ...acceptedFiles]);
    setRejectedFiles(invalidFiles);
  }

  function handleClear() {
    setUploadedFiles([]);
    setRejectedFiles([]);
    setRequirements("");
    setResult(null);
    setError(null);
  }

  async function buildGenerationContext() {
    const manualRequirements = requirements.trim();

    if (!uploadedFiles.length && !manualRequirements) {
      throw new Error("Upload a document, enter requirements, or use both.");
    }

    const sections = [];

    if (uploadedFiles.length > 0) {
      const uploadedDocuments = await Promise.all(
        uploadedFiles.map(async (file) => architectureApi.uploadDocument(file))
      );

      const uploadedText = uploadedDocuments
        .map((document, index) => {
          const name = document.filename || uploadedFiles[index]?.name || `Document ${index + 1}`;
          return `Document: ${name}\n${document.extracted_text}`;
        })
        .join("\n\n---\n\n");

      if (uploadedText.trim()) {
        sections.push(`Uploaded Requirement Context:\n${uploadedText}`);
      }
    }

    if (manualRequirements) {
      sections.push(`Manual Requirements:\n${manualRequirements}`);
    }

    return sections.join("\n\n");
  }

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);

    try {
      const generationContext = await buildGenerationContext();

      // Call FastAPI backend
      const response = await architectureApi.generateArchitecture(generationContext);

      setResult(response);

      // Extract ID from response (backend should return it)
      // Use ?? (nullish coalescing) instead of || to handle 0 as a valid ID
      const architectureId = response.id ?? response.run_id;
      
      if (!architectureId && architectureId !== 0) {
        return;
      }

      // Navigate to detail page to view the generated architecture
      navigate(`/architecture/${architectureId}`);
      
    } catch (err) {
      setError(err.message);
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <AppLayout>
      <div>
        <h1 className="text-4xl font-bold text-white">AI Architecture Workspace</h1>

        <p className="mt-2 text-zinc-400">
          Upload a document, enter requirements, or use both for richer context.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <div className="flex gap-4">
            <AlertCircle className="size-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-300">Error</p>
              <p className="mt-1 text-sm text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="mt-8 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader className="size-12 animate-spin text-cyan-400" />
            <div>
              <p className="text-lg font-semibold text-cyan-300">Analyzing requirements...</p>
              <p className="mt-1 text-sm text-zinc-400">
                Processing your requirements with AI to generate architecture recommendations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && !isGenerating && !result.id && (
        <>
          <ArchitectureResult architecture={result} />
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleClear}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
            >
              Start New Analysis
            </button>
          </div>
        </>
      )}

      {/* Input Section (hidden when showing results) */}
      {!result && (
        <div className="mt-10 space-y-8">
          <UploadDropzone onFilesSelected={handleFilesSelected} disabled={isGenerating} />

          {uploadedFiles.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Selected files</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                {uploadedFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          {rejectedFiles.length > 0 && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              Some files were skipped. Only PDF, DOCX, and TXT are supported.
            </div>
          )}

          <RequirementTextarea
            value={requirements}
            onChange={(event) => setRequirements(event.target.value)}
            disabled={isGenerating}
            placeholder="Enter requirements manually, or combine them with uploaded documents for richer context..."
          />

          <UploadActions
            onGenerate={handleGenerate}
            onClear={handleClear}
            isGenerating={isGenerating}
            disabled={!uploadedFiles.length && !requirements.trim()}
            canClear={uploadedFiles.length > 0 || requirements.length > 0 || rejectedFiles.length > 0}
          />
        </div>
      )}
    </AppLayout>
  );
}

export default UploadPage;
