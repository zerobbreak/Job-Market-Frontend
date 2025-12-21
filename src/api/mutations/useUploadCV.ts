import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cvService } from '../services';
import { useToast } from '@/components/ui/toast';

export const useUploadCV = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ file, overwrite }: { file: File; overwrite?: boolean }) =>
      cvService.upload(file, overwrite),

    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['cvs'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });

        toast.show({
          title: 'CV uploaded',
          description: 'Your profile has been updated.',
          variant: 'success',
        });
      }
    },

    onError: (error: any) => {
      // Don't show error toast for duplicate errors (handled by component)
      if (error.error !== 'duplicate_exact' && error.error !== 'duplicate_filename') {
        toast.show({
          title: 'Upload failed',
          description: error.message || 'Failed to upload CV',
          variant: 'error',
        });
      }
    },
  });
};
