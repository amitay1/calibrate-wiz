import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardType } from "@/types/techniqueSheet";
import { Lock, Check } from "lucide-react";
import { useStandardAccess } from "@/hooks/useStandardAccess";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StandardSelectorProps {
  value: StandardType;
  onChange: (value: StandardType) => void;
}

const standards = [
  { 
    value: "AMS-STD-2154E", 
    label: "AMS-STD-2154E (Revision E)", 
    description: "Aerospace Materials Specification - Ultrasonic Inspection" 
  },
  { 
    value: "ASTM-A388", 
    label: "ASTM A388/A388M", 
    description: "Ultrasonic Examination of Heavy Steel Forgings" 
  },
] as const;

export const StandardSelector = ({ value, onChange }: StandardSelectorProps) => {
  const navigate = useNavigate();
  const { hasAccess, isLoading } = useStandardAccess(value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Inspection Standard</label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full bg-card border-border">
          <SelectValue placeholder="Select a standard..." />
        </SelectTrigger>
        <SelectContent>
          {standards.map((standard) => {
            const isCurrentStandard = standard.value === value;
            const isLocked = isCurrentStandard && !hasAccess && !isLoading;
            const hasCurrentAccess = isCurrentStandard && hasAccess;
            
            return (
              <SelectItem 
                key={standard.value} 
                value={standard.value}
                disabled={isLocked}
                className="py-3"
              >
                <div className="flex items-start justify-between w-full gap-3">
                  <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm break-words">{standard.label}</span>
                      {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                      {hasCurrentAccess && <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />}
                    </div>
                    <span className="text-xs text-muted-foreground leading-relaxed break-words">
                      {standard.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {!hasAccess && !isLoading && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/50 rounded-md border">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground leading-relaxed break-words">
              This standard is locked. Purchase it to use it.
            </span>
          </div>
          <Button 
            size="sm" 
            variant="default"
            onClick={() => navigate('/standards')}
            className="flex-shrink-0 w-full sm:w-auto"
          >
            Unlock Standard
          </Button>
        </div>
      )}
    </div>
  );
};
