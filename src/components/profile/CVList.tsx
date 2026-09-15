import { FileText, Loader2, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

import { filesService } from "@/api/services";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export interface CVFile {
  $id: string;
  fileId: string;
  name: string;
  $createdAt: string;
  sizeOriginal?: number;
}

interface CVListProps {
  files: CVFile[];
  isLoading: boolean;
  bucketId: string;
  onDelete: (fileId: string) => Promise<void>;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(value: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function CVList({ files, isLoading, bucketId, onDelete }: CVListProps) {
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const FILES_PER_PAGE = 5;

  const totalPages = Math.ceil(files.length / FILES_PER_PAGE);
  const displayedFiles = files.slice(
    (page - 1) * FILES_PER_PAGE,
    page * FILES_PER_PAGE
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (file: CVFile) => {
    setOpeningId(file.$id);
    try {
      const { url } = await filesService.getSignedUrl(file.fileId, bucketId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open CV:", error);
      toast.show({
        title: "Couldn't open that file",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setOpeningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-neutral-500" role="status">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your CVs
      </div>
    );
  }

  if (files.length === 0) {
    return null; // Parent shows the upload state
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {displayedFiles.map((file) => (
          <li
            key={file.$id}
            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-300"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                <FileText className="h-4 w-4 text-neutral-600" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => handleView(file)}
                  disabled={openingId === file.$id}
                  className="block max-w-full truncate text-left text-sm font-medium text-neutral-900 underline-offset-4 hover:underline disabled:opacity-50"
                >
                  {file.name}
                </button>
                <p className="text-xs text-neutral-500">
                  Uploaded {formatDate(file.$createdAt)}
                  {file.sizeOriginal
                    ? ` · ${(file.sizeOriginal / 1024 / 1024).toFixed(2)} MB`
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleView(file)}
                disabled={openingId === file.$id}
                aria-label={`View ${file.name}`}
                title="View"
              >
                {openingId === file.$id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Eye />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleDelete(file.$id)}
                disabled={!!deletingId}
                aria-label={`Delete ${file.name}`}
                title="Delete"
              >
                {deletingId === file.$id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Trash2 />
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-neutral-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
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
