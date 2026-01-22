import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { cvService } from '@/api/services/cv.service';
import { useToast } from '../ui/toast';

interface AIImproveButtonProps {
  text: string;
  section: string;
  onImprove: (newText: string) => void;
  className?: string;
}

const AIImproveButton: React.FC<AIImproveButtonProps> = ({ text, section, onImprove, className }) => {
  const [loading, setLoading] = useState(false);
  const { show: toast } = useToast();

  const handleImprove = async () => {
    if (!text || text.length < 10) {
      toast({
        title: "Text too short",
        description: "Please enter at least a few words to improve.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await cvService.improveText(text, section);
      if (result.improved_text) {
        onImprove(result.improved_text);
        toast({
          title: "Text Improved",
          description: "AI has enhanced your text. Feel free to edit further.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to improve text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-6 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 ${className}`}
      onClick={handleImprove}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3 mr-1" />
      )}
      {loading ? 'Improving...' : 'Improve with AI'}
    </Button>
  );
};

export default AIImproveButton;
