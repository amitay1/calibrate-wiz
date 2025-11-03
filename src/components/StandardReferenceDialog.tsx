import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { StandardReference } from "@/data/standardReferences";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface StandardReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: StandardReference | undefined;
  fieldLabel: string;
}

export const StandardReferenceDialog = ({
  open,
  onOpenChange,
  reference,
  fieldLabel
}: StandardReferenceDialogProps) => {
  if (!reference) return null;

  const handleOpenPDF = () => {
    // Open the PDF in a new tab, scrolled to the relevant section if possible
    window.open('/standards/MIL-STD-2154.pdf', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl">
              {fieldLabel}
            </DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              MIL-STD-2154 {reference.section}
            </Badge>
            {reference.table && (
              <Badge variant="outline" className="text-xs bg-accent/10">
                {reference.table}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 text-foreground">
                {reference.title}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {reference.text}
              </p>
            </div>

            {reference.table && (
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  📋 For complete details, refer to <strong>{reference.table}</strong> in the full standard document.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPDF}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Standard (PDF)
          </Button>
          
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
