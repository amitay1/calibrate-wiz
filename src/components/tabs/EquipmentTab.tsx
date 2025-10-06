import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EquipmentData } from "@/types/techniqueSheet";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface EquipmentTabProps {
  data: EquipmentData;
  onChange: (data: EquipmentData) => void;
  partThickness: number;
}

const FieldWithHelp = ({ 
  label, 
  help, 
  required, 
  autoFilled,
  children 
}: { 
  label: string; 
  help: string; 
  required?: boolean;
  autoFilled?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {autoFilled && (
        <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent">
          Auto-filled
        </Badge>
      )}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs bg-popover border shadow-lg">
            <p className="text-xs">{help}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    {children}
  </div>
);

const frequencies = ["1.0", "2.25", "5.0", "10.0", "15.0"];
const transducerTypes = ["immersion", "contact", "dual_element"];

const getRecommendedFrequency = (thickness: number): string => {
  if (thickness < 12.7) return "10.0";
  if (thickness < 25.4) return "5.0";
  if (thickness < 50.8) return "2.25";
  return "1.0";
};

const getResolutionValues = (frequency: string) => {
  const resolutions: Record<string, { entry: number; back: number }> = {
    "1.0": { entry: 0.5, back: 0.2 },
    "2.25": { entry: 0.25, back: 0.1 },
    "5.0": { entry: 0.125, back: 0.05 },
    "10.0": { entry: 0.05, back: 0.025 },
    "15.0": { entry: 0.05, back: 0.025 },
  };
  return resolutions[frequency] || { entry: 0.125, back: 0.05 };
};

export const EquipmentTab = ({ data, onChange, partThickness }: EquipmentTabProps) => {
  const updateField = (field: keyof EquipmentData, value: any) => {
    let newData = { ...data, [field]: value };
    
    // Auto-fill resolution when frequency changes
    if (field === "frequency") {
      const resolutions = getResolutionValues(value);
      newData = {
        ...newData,
        entrySurfaceResolution: resolutions.entry,
        backSurfaceResolution: resolutions.back,
      };
    }
    
    onChange(newData);
  };

  // Auto-recommend frequency based on thickness
  const recommendedFreq = getRecommendedFrequency(partThickness);

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWithHelp
          label="Equipment Manufacturer"
          help="UT equipment manufacturer name"
          required
        >
          <Input
            value={data.manufacturer}
            onChange={(e) => updateField("manufacturer", e.target.value)}
            placeholder="Olympus, GE Inspection Technologies, etc."
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Equipment Model"
          help="Model number and type"
          required
        >
          <Input
            value={data.model}
            onChange={(e) => updateField("model", e.target.value)}
            placeholder="OmniScan X3, USM Vision, etc."
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Serial Number"
          help="Equipment serial number for traceability"
        >
          <Input
            value={data.serialNumber}
            onChange={(e) => updateField("serialNumber", e.target.value)}
            placeholder="SN-12345"
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Frequency (MHz)"
          help={`Operating frequency - ${recommendedFreq} MHz recommended for ${partThickness}mm thickness`}
          required
          autoFilled={data.frequency === recommendedFreq}
        >
          <Select
            value={data.frequency}
            onValueChange={(value) => updateField("frequency", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select frequency..." />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq} value={freq}>
                  {freq} MHz {freq === recommendedFreq && "⭐"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Transducer Type"
          help="Type of transducer being used"
          required
        >
          <Select
            value={data.transducerType}
            onValueChange={(value) => updateField("transducerType", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {transducerTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Active Element Diameter (inches)"
          help="Immersion: 3/8 to 3/4 inch, Contact: 1/4 to 1 inch (Table III)"
          required
        >
          <Input
            type="number"
            value={data.transducerDiameter}
            onChange={(e) => updateField("transducerDiameter", parseFloat(e.target.value) || 0)}
            min={0.25}
            max={1.0}
            step={0.125}
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Couplant Type"
          help="Type and brand of couplant used"
          required
        >
          <Input
            value={data.couplant}
            onChange={(e) => updateField("couplant", e.target.value)}
            placeholder="Water, Glycerin, Commercial gel"
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Vertical Linearity (%)"
          help="Must be 10-95% for MIL-STD, 5-98% for AMS (Table II)"
          required
        >
          <Input
            type="number"
            value={data.verticalLinearity}
            onChange={(e) => updateField("verticalLinearity", parseFloat(e.target.value) || 0)}
            min={5}
            max={100}
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Horizontal Linearity (%)"
          help="Minimum 85% (MIL-STD) or 90% (AMS) per Table II"
          required
        >
          <Input
            type="number"
            value={data.horizontalLinearity}
            onChange={(e) => updateField("horizontalLinearity", parseFloat(e.target.value) || 0)}
            min={85}
            max={100}
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Entry Surface Resolution (inches)"
          help="Auto-filled based on frequency per Table II"
          required
          autoFilled
        >
          <Input
            type="number"
            value={data.entrySurfaceResolution}
            onChange={(e) => updateField("entrySurfaceResolution", parseFloat(e.target.value) || 0)}
            className="bg-background"
            disabled
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Back Surface Resolution (inches)"
          help="Auto-filled based on frequency per Table II"
          required
          autoFilled
        >
          <Input
            type="number"
            value={data.backSurfaceResolution}
            onChange={(e) => updateField("backSurfaceResolution", parseFloat(e.target.value) || 0)}
            className="bg-background"
            disabled
          />
        </FieldWithHelp>
      </div>
    </div>
  );
};
