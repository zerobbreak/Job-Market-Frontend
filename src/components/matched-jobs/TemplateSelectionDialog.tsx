import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: "MODERN" | "PROFESSIONAL" | "ACADEMIC";
  onTemplateChange: (template: "MODERN" | "PROFESSIONAL" | "ACADEMIC") => void;
  onConfirm: () => void;
}

export function TemplateSelectionDialog({
  open,
  onOpenChange,
  template,
  onTemplateChange,
  onConfirm,
}: TemplateSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Application Template</DialogTitle>
          <DialogDescription>
            Select a style for your tailored CV and cover letter.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template" className="text-right">
              Template
            </Label>
            <Select
              value={template}
              onValueChange={(v: any) => onTemplateChange(v)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MODERN">Modern (Recommended)</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ACADEMIC">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Generate Application</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
