import { useRef, useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CVUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  className?: string;
}

export function CVUploader({
  onUpload,
  isUploading,
  className,
}: CVUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validation
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file.size > MAX_SIZE) {
      setError("That file is over 10MB. Try a smaller one.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a PDF or Word document.");
      return;
    }

    onUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
        dragActive
          ? "border-neutral-900 bg-neutral-50"
          : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/60",
        isUploading && "pointer-events-none",
        className,
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center" aria-live="polite">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" strokeWidth={1.75} />
          )}
        </div>

        <p className="font-medium text-neutral-900">
          {isUploading ? "Reading your CV…" : "Drop your CV here"}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          {isUploading
            ? "Pulling out your skills and experience."
            : "PDF, DOC, or DOCX, up to 10MB"}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {!isUploading && (
          <Button onClick={() => inputRef.current?.click()} className="mt-5">
            Choose a file
          </Button>
        )}
      </div>
    </div>
  );
}
