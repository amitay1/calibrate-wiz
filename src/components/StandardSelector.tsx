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
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{standard.label}</span>
                      {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      {hasCurrentAccess && <Check className="h-3 w-3 text-success" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{standard.description}</span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {!hasAccess && !isLoading && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              This standard is locked. Purchase it to use it.
            </span>
          </div>
          <Button 
            size="sm" 
            variant="default"
            onClick={() => navigate('/standards')}
          >
            Unlock Standard
          </Button>
        </div>
      )}
    </div>
  );
};
