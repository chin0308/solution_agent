import { useMemo, useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const allowedExtensions = new Set(["pdf", "docx", "txt"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function isAcceptedFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return allowedMimeTypes.has(file.type) || (extension && allowedExtensions.has(extension));
}

function UploadDropzone({ onFilesSelected, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const acceptedHint = useMemo(() => "PDF, DOCX, TXT", []);

  function emitSelection(fileList) {
    const files = Array.from(fileList ?? []);
    const acceptedFiles = files.filter(isAcceptedFile);
    const rejectedFiles = files.filter((file) => !isAcceptedFile(file));
    onFilesSelected?.({ acceptedFiles, rejectedFiles });
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) {
      return;
    }
    emitSelection(event.dataTransfer.files);
  }

  function handleInputChange(event) {
    emitSelection(event.target.files);
    event.target.value = "";
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <p className="text-sm font-medium text-zinc-200">Document Upload</p>
      <p className="mt-1 text-xs text-zinc-500">Drag and drop enterprise requirement artifacts</p>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-4 rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? "border-cyan-400 bg-cyan-500/10"
            : "border-zinc-700 bg-zinc-950/60 hover:border-zinc-500 hover:bg-zinc-900/80"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="rounded-full border border-zinc-700 bg-zinc-900 p-3">
            <UploadCloud className="size-6 text-cyan-300" />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-200">Drop files here or browse</p>
          <p className="mt-2 text-xs text-zinc-500">Accepted formats: {acceptedHint}</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            disabled={disabled}
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleInputChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="mt-5 border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            <FileUp />
            Select Files
          </Button>
        </div>
      </div>
    </section>
  );
}

export default UploadDropzone;
