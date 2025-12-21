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
      setError("File is too large. Max 10MB.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, DOC, or DOCX.");
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
        "relative rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out p-8 text-center",
        dragActive
          ? "border-primary bg-primary/5 ring-4 ring-primary/10"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
        isUploading && "opacity-60 pointer-events-none",
        className
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

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "p-4 rounded-full transition-colors",
            dragActive
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-lg tracking-tight">
            {isUploading ? "Uploading..." : "Upload your CV"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Drag and drop your resume here, or click to browse.
            <br />
            <span className="text-xs opacity-75">PDF, DOCX up to 10MB</span>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button
          onClick={() => inputRef.current?.click()}
          variant="default"
          size="lg"
          disabled={isUploading}
          className="mt-2"
        >
          {isUploading ? "Processing..." : "Select File"}
        </Button>
      </div>
    </div>
  );
}
