import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalibrationData, InspectionSetupData, AcceptanceClass } from "@/types/techniqueSheet";
import { Info, Target, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { generateCalibrationRecommendation } from "@/utils/calibrationRecommender";
import { CalibrationRecommendationModal } from "../CalibrationRecommendationModal";
import { toast } from "sonner";

interface CalibrationTabProps {
  data: CalibrationData;
  onChange: (data: CalibrationData) => void;
  inspectionSetup: InspectionSetupData;
  acceptanceClass: AcceptanceClass | "";
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

const blockTypes = [
  { value: "flat_block", label: "Flat Block (Figure 4)" },
  { value: "curved_block", label: "Curved Block (Figure 3)" },
  { value: "cylinder_notched", label: "Hollow Cylindrical - Notched (Figure 5)" },
  { value: "cylinder_fbh", label: "Hollow Cylindrical - FBH (Figure 6)" },
  { value: "angle_beam", label: "Type IIv Reference (Figure 7)" },
];

export const CalibrationTab = ({ data, onChange, inspectionSetup, acceptanceClass }: CalibrationTabProps) => {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const updateField = (field: keyof CalibrationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const canGenerateRecommendation = 
    inspectionSetup.material && 
    inspectionSetup.partType && 
    inspectionSetup.partThickness >= 6.35 &&
    acceptanceClass;

  const handleGetRecommendation = () => {
    if (!canGenerateRecommendation) {
      toast.error("Please complete Inspection Setup and select Acceptance Class first");
      return;
    }

    try {
      const rec = generateCalibrationRecommendation({
        material: inspectionSetup.material as any,
        materialSpec: inspectionSetup.materialSpec,
        partType: inspectionSetup.partType as any,
        thickness: inspectionSetup.partThickness,
        acceptanceClass: acceptanceClass as any,
      });
      
      setRecommendation(rec);
      setShowRecommendation(true);
      toast.success("Calibration model recommended!");
    } catch (error) {
      toast.error("Failed to generate recommendation");
      console.error(error);
    }
  };

  const handleApplyRecommendation = () => {
    if (!recommendation) return;

    onChange({
      ...data,
      standardType: recommendation.standardType,
      referenceMaterial: recommendation.material,
      fbhSizes: recommendation.fbhSizes.join(", "),
      metalTravelDistance: recommendation.metalTravel.distances[0],
    });

    toast.success("Calibration recommendation applied to form!");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Auto Recommendation Card */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              🤖 Auto-Recommend Calibration Model
              <Sparkles className="h-5 w-5 text-accent" />
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your part specifications, we can recommend the optimal calibration block configuration,
              FBH sizes, and metal travel distances per MIL-STD-2154. Saves 2+ hours of manual lookup!
            </p>
            <Button 
              onClick={handleGetRecommendation}
              disabled={!canGenerateRecommendation}
              className="gradient-primary shadow-lg"
            >
              <Target className="h-4 w-4 mr-2" />
              Get Recommendation
            </Button>
            {!canGenerateRecommendation && (
              <p className="text-xs text-muted-foreground mt-2">
                Complete Inspection Setup tab and select Acceptance Class first
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Manual Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWithHelp
          label="Calibration Standard Type"
          help="Reference standard configuration per MIL-STD-2154 Section 5.3"
          required
          autoFilled={!!recommendation}
        >
          <Select
            value={data.standardType}
            onValueChange={(value) => updateField("standardType", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select standard type..." />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {blockTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Reference Standard Material"
          help="Must match part material per Table I"
          required
          autoFilled={!!recommendation}
        >
          <Input
            value={data.referenceMaterial}
            onChange={(e) => updateField("referenceMaterial", e.target.value)}
            placeholder="Ti-6Al-4V annealed (AMS 4928)"
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Flat-Bottom Hole Sizes (inches)"
          help="Comma-separated FBH sizes used (e.g., 2/64, 3/64)"
          required
          autoFilled={!!recommendation}
        >
          <Input
            value={data.fbhSizes}
            onChange={(e) => updateField("fbhSizes", e.target.value)}
            placeholder="2/64, 3/64, 5/64"
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Metal Travel Distance (mm)"
          help="Distance from entry surface to FBH per Table IV"
          required
          autoFilled={!!recommendation}
        >
          <Input
            type="number"
            value={data.metalTravelDistance}
            onChange={(e) => updateField("metalTravelDistance", parseFloat(e.target.value) || 0)}
            min={0}
            step={0.1}
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Block Dimensions (L×W×H mm)"
          help="Physical dimensions of calibration block"
        >
          <Input
            value={data.blockDimensions}
            onChange={(e) => updateField("blockDimensions", e.target.value)}
            placeholder="150 × 75 × 50"
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Block Serial Number"
          help="Serial number for traceability"
        >
          <Input
            value={data.blockSerialNumber}
            onChange={(e) => updateField("blockSerialNumber", e.target.value)}
            placeholder="CAL-2024-001"
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Block Last Calibrated"
          help="Date of last calibration verification"
        >
          <Input
            type="date"
            value={data.lastCalibrationDate}
            onChange={(e) => updateField("lastCalibrationDate", e.target.value)}
            className="bg-background"
          />
        </FieldWithHelp>
      </div>

      {/* Recommendation Modal */}
      <CalibrationRecommendationModal
        open={showRecommendation}
        onOpenChange={setShowRecommendation}
        recommendation={recommendation}
        onApply={handleApplyRecommendation}
        partInfo={{
          material: inspectionSetup.materialSpec || inspectionSetup.material,
          partType: inspectionSetup.partType,
          thickness: inspectionSetup.partThickness,
          acceptanceClass: acceptanceClass || "N/A"
        }}
      />
    </div>
  );
};
