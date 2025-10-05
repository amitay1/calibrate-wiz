import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InspectionSetupData, MaterialType, PartGeometry } from "@/types/techniqueSheet";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InspectionSetupTabProps {
  data: InspectionSetupData;
  onChange: (data: InspectionSetupData) => void;
}

const materials: { value: MaterialType; label: string }[] = [
  { value: "aluminum", label: "Aluminum" },
  { value: "steel", label: "Steel" },
  { value: "titanium", label: "Titanium" },
  { value: "magnesium", label: "Magnesium" },
];

const partTypes: { value: PartGeometry; label: string }[] = [
  { value: "plate", label: "Plate" },
  { value: "bar", label: "Bar" },
  { value: "forging", label: "Forging" },
  { value: "tube", label: "Tube" },
  { value: "ring", label: "Ring" },
  { value: "disk", label: "Disk" },
];

const materialSpecs: Record<MaterialType, string[]> = {
  aluminum: ["7075-T6 (QQ-A200/11)", "2024 (QQ-A-200/3)", "6061-T6", "2219-T87"],
  steel: ["4340 annealed (MIL-S-5000)", "4130", "17-4 PH", "15-5 PH"],
  titanium: ["Ti-6Al-4V annealed (AMS 4928)", "Ti-6Al-4V STA", "Ti-5Al-2.5Sn", "CP Ti Grade 2"],
  magnesium: ["ZK60A (QQ-M-31)", "AZ31B", "AZ80A", "ZE41A"],
};

const FieldWithHelp = ({ 
  label, 
  help, 
  required, 
  children 
}: { 
  label: string; 
  help: string; 
  required?: boolean; 
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs">{help}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    {children}
  </div>
);

export const InspectionSetupTab = ({ data, onChange }: InspectionSetupTabProps) => {
  const updateField = (field: keyof InspectionSetupData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const showDiameter = data.partType === "tube" || data.partType === "ring";

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWithHelp
          label="Part Number"
          help="Drawing or part number for identification"
          required
        >
          <Input
            value={data.partNumber}
            onChange={(e) => updateField("partNumber", e.target.value)}
            placeholder="P/N 12345-678"
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Part Name"
          help="Descriptive name of the part being inspected"
          required
        >
          <Input
            value={data.partName}
            onChange={(e) => updateField("partName", e.target.value)}
            placeholder="Landing Gear Support Bracket"
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Material"
          help="Base material type of the part"
          required
        >
          <Select 
            value={data.material} 
            onValueChange={(value) => {
              updateField("material", value);
              updateField("materialSpec", "");
            }}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select material..." />
            </SelectTrigger>
            <SelectContent>
              {materials.map((mat) => (
                <SelectItem key={mat.value} value={mat.value}>
                  {mat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Material Specification"
          help="Specific material specification (e.g., 7075-T6, Ti-6Al-4V)"
          required
        >
          <Select
            value={data.materialSpec}
            onValueChange={(value) => updateField("materialSpec", value)}
            disabled={!data.material}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={data.material ? "Select specification..." : "Select material first"} />
            </SelectTrigger>
            <SelectContent>
              {data.material && materialSpecs[data.material as MaterialType].map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Part Type/Geometry"
          help="General geometry classification of the part"
          required
        >
          <Select
            value={data.partType}
            onValueChange={(value) => updateField("partType", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select geometry..." />
            </SelectTrigger>
            <SelectContent>
              {partTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Part Thickness (mm)"
          help="Nominal thickness - must be ≥ 6.35mm per MIL-STD scope"
          required
        >
          <Input
            type="number"
            value={data.partThickness}
            onChange={(e) => updateField("partThickness", parseFloat(e.target.value) || 0)}
            min={6.35}
            step={0.1}
            className="bg-background"
          />
          {data.partThickness < 6.35 && data.partThickness > 0 && (
            <p className="text-xs text-destructive mt-1">
              Must be ≥ 6.35mm per standard scope
            </p>
          )}
        </FieldWithHelp>

        <FieldWithHelp
          label="Part Length (mm)"
          help="Length of the part for 3D visualization"
        >
          <Input
            type="number"
            value={data.partLength}
            onChange={(e) => updateField("partLength", parseFloat(e.target.value) || 0)}
            min={0}
            step={0.1}
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Part Width (mm)"
          help="Width of the part for 3D visualization"
        >
          <Input
            type="number"
            value={data.partWidth}
            onChange={(e) => updateField("partWidth", parseFloat(e.target.value) || 0)}
            min={0}
            step={0.1}
            className="bg-background"
          />
        </FieldWithHelp>

        {showDiameter && (
          <FieldWithHelp
            label="Diameter (mm)"
            help="Outer diameter for cylindrical parts"
            required={showDiameter}
          >
            <Input
              type="number"
              value={data.diameter || 0}
              onChange={(e) => updateField("diameter", parseFloat(e.target.value) || 0)}
              min={0}
              step={0.1}
              className="bg-background"
            />
          </FieldWithHelp>
        )}
      </div>
    </div>
  );
};
