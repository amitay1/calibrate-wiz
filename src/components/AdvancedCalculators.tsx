import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Waves, Target, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MaterialType } from "@/types/techniqueSheet";
import { materialDatabase } from "@/utils/autoFillLogic";

interface AdvancedCalculatorsProps {
  frequency?: string;
  transducerDiameter?: string;
  material?: MaterialType;
  thickness?: number;
}

export const AdvancedCalculators = ({
  frequency,
  transducerDiameter,
  material,
  thickness
}: AdvancedCalculatorsProps) => {
  const [nearField, setNearField] = useState<number | null>(null);
  const [beamSpread, setBeamSpread] = useState<number | null>(null);
  const [wavelength, setWavelength] = useState<number | null>(null);

  useEffect(() => {
    if (frequency && transducerDiameter && material) {
      calculateNearField();
      calculateBeamSpread();
    }
  }, [frequency, transducerDiameter, material]);

  const calculateNearField = () => {
    if (!frequency || !transducerDiameter || !material) return;

    const freq = parseFloat(frequency) * 1000000; // MHz to Hz
    const diameter = parseFloat(transducerDiameter) * 25.4; // inches to mm
    const velocity = materialDatabase[material].velocity; // mm/µs
    const lambda = (velocity * 1000) / freq; // wavelength in mm

    // N = D²/4λ
    const N = (diameter * diameter) / (4 * lambda);
    
    setWavelength(lambda);
    setNearField(N);
  };

  const calculateBeamSpread = () => {
    if (!frequency || !transducerDiameter || !material || !wavelength) return;

    const diameter = parseFloat(transducerDiameter) * 25.4; // inches to mm
    
    // sin(θ/2) = 0.514(λ/D)
    const sinHalfAngle = 0.514 * (wavelength / diameter);
    const halfAngle = Math.asin(Math.min(sinHalfAngle, 1)) * (180 / Math.PI);
    const fullAngle = halfAngle * 2;
    
    setBeamSpread(fullAngle);
  };

  const getBeamSpreadColor = (angle: number) => {
    if (angle < 10) return "bg-success text-success-foreground";
    if (angle < 20) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getNearFieldColor = (nf: number, thick: number) => {
    if (nf < thick * 0.5) return "bg-success text-success-foreground";
    if (nf < thick) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>Advanced Beam Calculations</CardTitle>
        </div>
        <CardDescription>
          Real-time calculations based on MIL-STD-2154 Table II
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Near Field Distance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <Label className="font-semibold">Near Field Distance (N)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-semibold">Formula: N = D²/4λ</p>
                  <p className="text-xs mt-1">
                    Where D = transducer diameter, λ = wavelength.
                    Near field is the region close to the transducer where the beam
                    is focused and has maximum intensity.
                  </p>
                  <p className="text-xs mt-2 font-medium">
                    MIL-STD-2154 Section 4.2.1
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {nearField !== null ? (
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-primary">
                {nearField.toFixed(2)} mm
              </div>
              {thickness && (
                <Badge className={getNearFieldColor(nearField, thickness)}>
                  {nearField < thickness * 0.5 
                    ? "✓ Excellent" 
                    : nearField < thickness 
                    ? "⚠ Acceptable" 
                    : "✗ Too Long"}
                </Badge>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Enter frequency, transducer diameter, and material to calculate
            </div>
          )}
          
          {nearField !== null && thickness && (
            <div className="text-xs text-muted-foreground mt-1">
              Part thickness: {thickness.toFixed(2)} mm 
              {nearField > thickness && (
                <span className="text-destructive font-medium ml-2">
                  ⚠ Near field exceeds part thickness - reduce frequency or use smaller transducer
                </span>
              )}
            </div>
          )}
        </div>

        {/* Wavelength */}
        {wavelength !== null && (
          <div className="space-y-1 border-t pt-3">
            <Label className="text-sm text-muted-foreground">Wavelength (λ)</Label>
            <div className="text-lg font-semibold">{wavelength.toFixed(4)} mm</div>
          </div>
        )}

        {/* Beam Spread */}
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-muted-foreground" />
            <Label className="font-semibold">Beam Spread Angle (θ)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p className="font-semibold">Formula: sin(θ/2) = 0.514(λ/D)</p>
                  <p className="text-xs mt-1">
                    Beam spread determines the lateral coverage area at a given depth.
                    Smaller angles provide better lateral resolution.
                  </p>
                  <p className="text-xs mt-2 font-medium">
                    MIL-STD-2154 Section 4.2.2
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {beamSpread !== null ? (
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-primary">
                {beamSpread.toFixed(2)}°
              </div>
              <Badge className={getBeamSpreadColor(beamSpread)}>
                {beamSpread < 10 
                  ? "✓ Focused Beam" 
                  : beamSpread < 20 
                  ? "⚠ Moderate Spread" 
                  : "✗ Wide Beam"}
              </Badge>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Enter frequency, transducer diameter, and material to calculate
            </div>
          )}

          {beamSpread !== null && (
            <div className="text-xs text-muted-foreground mt-1">
              {beamSpread < 10 
                ? "Excellent lateral resolution - suitable for detecting small defects"
                : beamSpread < 20
                ? "Good for general inspection - may have reduced lateral resolution"
                : "Wide beam - consider higher frequency or larger transducer for better resolution"}
            </div>
          )}
        </div>

        {/* Metal Travel Distance Reference */}
        {thickness && (
          <div className="space-y-1 border-t pt-3">
            <Label className="text-sm text-muted-foreground">
              Recommended Metal Travel Distance
            </Label>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">
                {Math.round((thickness * 3) / 5) * 5} mm
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      Formula: MTD = 3T (rounded to nearest 5mm)
                    </p>
                    <p className="text-xs mt-1">
                      MIL-STD-2154 Table IV
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
