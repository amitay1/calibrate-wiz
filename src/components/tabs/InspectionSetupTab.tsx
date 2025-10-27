import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InspectionSetupData, MaterialType, PartGeometry, AcceptanceClass } from "@/types/techniqueSheet";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { materialDatabase } from "@/utils/autoFillLogic";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { PartTypeVisualSelector } from "@/components/PartTypeVisualSelector";

interface InspectionSetupTabProps {
  data: InspectionSetupData;
  onChange: (data: InspectionSetupData) => void;
  acceptanceClass?: AcceptanceClass | "";
}

const materials: { value: MaterialType; label: string }[] = [
  { value: "aluminum", label: "Aluminum" },
  { value: "steel", label: "Steel" },
  { value: "stainless_steel", label: "Stainless Steel" },
  { value: "titanium", label: "Titanium" },
  { value: "magnesium", label: "Magnesium" },
];


interface PartTypeOption {
  value: PartGeometry;
  label: string;
  description?: string;
}

const partTypes: PartTypeOption[] = [
  { value: "plate", label: "Plate", description: "Two-axis raster" },
  { value: "rectangular_bar", label: "Rectangular Bar", description: "Scan from multiple faces" },
  { value: "round_bar", label: "Round Bar", description: "Radial + axial scans" },
  { value: "square_bar", label: "Square Bar", description: "Scan from adjacent faces" },
  { value: "round_forging_stock", label: "Round Forging Stock", description: "Consider grain structure" },
  { value: "ring_forging", label: "Ring Forging ⭐", description: "Radial + axial + shear wave" },
  { value: "disk_forging", label: "Disk Forging", description: "Flat face + radial" },
  { value: "hex_bar", label: "Hex Bar", description: "3 adjacent faces" },
  { value: "tube", label: "Tube / Pipe", description: "ID + OD coverage" },
  { value: "shaft", label: "Shaft", description: "Axial + circumferential" },
  { value: "billet", label: "Billet / Block", description: "Two-axis raster" },
  { value: "sleeve", label: "Sleeve / Bushing", description: "Short hollow cylinder" },
  { value: "bar", label: "Bar (Generic)", description: "Use specific type if known" },
  { value: "forging", label: "Forging (Generic)", description: "Use specific type if known" },
  { value: "ring", label: "Ring (Generic)", description: "Use ring_forging if applicable" },
  { value: "disk", label: "Disk (Generic)", description: "Use disk_forging if applicable" },
];


const materialSpecs: Record<MaterialType, string[]> = {
  aluminum: ["7075-T6 (QQ-A200/11)", "2024 (QQ-A-200/3)", "6061-T6", "2219-T87"],
  steel: ["4340 annealed (MIL-S-5000)", "4130", "17-4 PH", "15-5 PH"],
  stainless_steel: ["304 (AMS 5513)", "316 (AMS 5524)", "17-4 PH (AMS 5604)", "15-5 PH (AMS 5659)", "410", "420"],
  titanium: ["Ti-6Al-4V annealed (AMS 4928)", "Ti-6Al-4V STA", "Ti-5Al-2.5Sn", "CP Ti Grade 2"],
  magnesium: ["ZK60A (QQ-M-31)", "AZ31B", "AZ80A", "ZE41A"],
};

const FieldWithHelp = ({ 
  label, 
  help, 
  required,
  autoFilled,
  materialInfo,
  children 
}: { 
  label: string; 
  help: string; 
  required?: boolean;
  autoFilled?: boolean;
  materialInfo?: string;
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
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        title="Auto-fill Features: Recommended settings based on material and thickness, standard-compliant parameters, historical data from similar inspections."
      >
        <Info className="h-4 w-4" />
      </Button>
    </div>
    {children}
  </div>
);

export const InspectionSetupTab = ({ data, onChange, acceptanceClass }: InspectionSetupTabProps) => {
  const updateField = (field: keyof InspectionSetupData, value: any) => {
    onChange({ ...data, [field]: value });
  };


  const showDiameter = data.partType === "tube" || data.partType === "ring";
  
  // Get material properties for info
  const materialProps = data.material ? materialDatabase[data.material as MaterialType] : null;
  const materialInfo = materialProps ? 
    `Velocity: ${materialProps.velocity} mm/µs | Density: ${materialProps.density} g/cm³ | ${materialProps.surfaceCondition}` : 
    undefined;

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
          materialInfo={materialInfo}
        >
          <Select 
            value={data.material} 
            onValueChange={(value: string) => {
              onChange({ ...data, material: value as MaterialType, materialSpec: "" });
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
          {materialProps && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-1">
              <div><strong>Velocity:</strong> {materialProps.velocity} mm/µs (Long.) | {materialProps.velocityShear} mm/µs (Shear)</div>
              <div><strong>Impedance:</strong> {materialProps.acousticImpedance} MRayls</div>
            </div>
          )}
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

        <div className="md:col-span-2">
          <FieldWithHelp
            label="Part Type/Geometry"
            help="Select the geometry of your part visually"
            required
          >
            <PartTypeVisualSelector
              value={data.partType}
              onChange={(value) => updateField("partType", value)}
            />
          </FieldWithHelp>
        </div>

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

      {/* Smart Recommendations Panel */}
      <SmartRecommendations
        geometry={data.partType}
        material={data.material}
        thickness={data.partThickness}
        width={data.partWidth}
        length={data.partLength}
        diameter={data.diameter}
        acceptanceClass={acceptanceClass}
      />
    </div>
  );
};
