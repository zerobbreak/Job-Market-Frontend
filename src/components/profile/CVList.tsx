import { FileText, Loader2, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

import { storage, BUCKET_ID_CVS } from "@/utils/appwrite";
import type { Models } from "appwrite";
import { useState } from "react";

interface CVListProps {
  files: Models.File[];
  isLoading: boolean;
  onDelete: (fileId: string) => Promise<void>;
}

export function CVList({ files, isLoading, onDelete }: CVListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const FILES_PER_PAGE = 5;

  const totalPages = Math.ceil(files.length / FILES_PER_PAGE);
  const displayedFiles = files.slice(
    (page - 1) * FILES_PER_PAGE,
    page * FILES_PER_PAGE
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading your documents...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return null; // Should be handled by parent to show upload state usually, or empty text
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {displayedFiles.map((file) => (
          <div
            key={file.$id}
            className="group flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card hover:border-border/80 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="p-3 bg-primary/10 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <a
                  href={storage.getFileView(BUCKET_ID_CVS, file.$id)}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate font-medium text-foreground hover:text-primary hover:underline transition-colors block max-w-[200px] sm:max-w-md"
                >
                  {file.name}
                </a>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  Uploaded on {new Date(file.$createdAt).toLocaleDateString()}
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  {(file.sizeOriginal / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                asChild
              >
                <a
                  href={storage.getFileView(BUCKET_ID_CVS, file.$id)}
                  target="_blank"
                  rel="noreferrer"
                  title="View CV"
                >
                  <Eye className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                onClick={() => handleDelete(file.$id)}
                disabled={!!deletingId}
                title="Delete CV"
              >
                {deletingId === file.$id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
