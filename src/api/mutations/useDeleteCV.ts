import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cvService } from "../services";
import { useToast } from "@/components/ui/toast";
import type { CVProfile } from "../types";

export const useDeleteCV = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: cvService.delete,

    onMutate: async (fileId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cvs"] });

      // Snapshot previous value
      const previousCVs = queryClient.getQueryData<CVProfile[]>(["cvs"]);

      // Optimistically update
      queryClient.setQueryData<CVProfile[]>(
        ["cvs"],
        (old) => old?.filter((cv) => cv.cv_file_id !== fileId) || []
      );

      return { previousCVs };
    },

    onError: (_err, _fileId, context) => {
      // Rollback on error
      if (context?.previousCVs) {
        queryClient.setQueryData(["cvs"], context.previousCVs);
      }

      toast.show({
        title: "Delete failed",
        description: "Could not delete CV",
        variant: "error",
      });
    },

    onSuccess: () => {
      toast.show({
        title: "CV deleted",
        description: "CV has been removed.",
        variant: "success",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
  });
};
