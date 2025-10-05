import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardType } from "@/types/techniqueSheet";

interface StandardSelectorProps {
  value: StandardType;
  onChange: (value: StandardType) => void;
}

const standards = [
  { value: "MIL-STD-2154", label: "MIL-STD-2154 (30 September 1982)", description: "Military/Aerospace" },
  { value: "AMS-STD-2154E", label: "AMS-STD-2154E (Revision E, 2019)", description: "Aerospace Materials" },
  { value: "ASTM-E-114", label: "ASTM E-114", description: "General Industrial" },
] as const;

export const StandardSelector = ({ value, onChange }: StandardSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Inspection Standard</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-card border-border">
          <SelectValue placeholder="Select a standard..." />
        </SelectTrigger>
        <SelectContent>
          {standards.map((standard) => (
            <SelectItem key={standard.value} value={standard.value}>
              <div className="flex flex-col">
                <span className="font-medium">{standard.label}</span>
                <span className="text-xs text-muted-foreground">{standard.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
