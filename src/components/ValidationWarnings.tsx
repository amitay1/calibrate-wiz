import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { MaterialType, StandardType } from "@/types/techniqueSheet";
import { materialDatabase, standardRules } from "@/utils/autoFillLogic";

interface ValidationWarningsProps {
  frequency?: string;
  thickness?: number;
  material?: MaterialType;
  standard?: StandardType;
  verticalLinearity?: { min: number; max: number };
  horizontalLinearity?: number;
  scanSpeed?: number;
  transducerDiameter?: string;
}

interface ValidationIssue {
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  reference?: string;
}

export const ValidationWarnings = ({
  frequency,
  thickness,
  material,
  standard,
  verticalLinearity,
  horizontalLinearity,
  scanSpeed,
  transducerDiameter
}: ValidationWarningsProps) => {
  const issues: ValidationIssue[] = [];

  // Frequency vs Thickness validation
  if (frequency && thickness && material) {
    const freq = parseFloat(frequency);
    const matProps = materialDatabase[material];
    const attenuation = matProps.attenuation;

    // High attenuation materials need lower frequencies
    if (attenuation > 5 && freq > 5.0) {
      issues.push({
        type: "warning",
        title: "Frequency Too High for Material",
        message: `${material} has high attenuation (${attenuation} dB/m). Frequency ${freq} MHz may cause excessive signal loss. Recommended: ≤5.0 MHz`,
        reference: "MIL-STD-2154 Table II"
      });
    }

    // Thickness-based frequency recommendations
    if (thickness < 12.7 && freq < 10.0) {
      issues.push({
        type: "info",
        title: "Resolution Could Be Improved",
        message: `For thin sections (<12.7mm), higher frequency (10-15 MHz) provides better resolution. Current: ${freq} MHz`,
        reference: "MIL-STD-2154 Section 4.2"
      });
    }

    if (thickness > 50.8 && freq > 2.25) {
      issues.push({
        type: "warning",
        title: "Frequency Too High for Thick Section",
        message: `For thick sections (>50mm), frequency should be ≤2.25 MHz for adequate penetration. Current: ${freq} MHz`,
        reference: "MIL-STD-2154 Table II"
      });
    }

    // Titanium special case
    if (material === "titanium" && freq > 5.0) {
      issues.push({
        type: "warning",
        title: "Titanium Attenuation Warning",
        message: `Titanium requires lower frequencies due to high attenuation. Recommended: 2.25-5.0 MHz. Current: ${freq} MHz`,
        reference: "MIL-STD-2154 Section 3.3"
      });
    }
  }

  // Linearity validation
  if (standard && verticalLinearity) {
    const rules = standardRules[standard];
    const { min, max } = verticalLinearity;

    if (min < rules.linearityRequirements.vertical.min) {
      issues.push({
        type: "error",
        title: "Vertical Linearity Out of Range",
        message: `Minimum vertical linearity (${min}%) is below standard requirement (${rules.linearityRequirements.vertical.min}%)`,
        reference: `${standard} Table II`
      });
    }

    if (max > rules.linearityRequirements.vertical.max) {
      issues.push({
        type: "error",
        title: "Vertical Linearity Out of Range",
        message: `Maximum vertical linearity (${max}%) exceeds standard limit (${rules.linearityRequirements.vertical.max}%)`,
        reference: `${standard} Table II`
      });
    }
  }

  if (standard && horizontalLinearity !== undefined) {
    const rules = standardRules[standard];
    if (horizontalLinearity < rules.linearityRequirements.horizontal.min) {
      issues.push({
        type: "error",
        title: "Horizontal Linearity Out of Range",
        message: `Horizontal linearity (${horizontalLinearity}%) is below minimum requirement (${rules.linearityRequirements.horizontal.min}%)`,
        reference: `${standard} Table II`
      });
    }
  }

  // Scan Speed validation
  if (scanSpeed) {
    const maxSpeed = standard === "AMS-STD-2154E" ? 150 : 200;
    if (scanSpeed > maxSpeed) {
      issues.push({
        type: "error",
        title: "Scan Speed Exceeds Limit",
        message: `Scan speed (${scanSpeed} mm/s) exceeds maximum allowed (${maxSpeed} mm/s) for ${standard}`,
        reference: `${standard} Section 5.4.10`
      });
    }

    if (scanSpeed > maxSpeed * 0.8) {
      issues.push({
        type: "warning",
        title: "Scan Speed Near Maximum",
        message: `Scan speed (${scanSpeed} mm/s) is close to limit (${maxSpeed} mm/s). Verify no loss of coverage or sensitivity.`,
        reference: `${standard} Section 5.4.10`
      });
    }
  }

  // Transducer diameter validation
  if (transducerDiameter && thickness) {
    const diameter = parseFloat(transducerDiameter) * 25.4; // inches to mm
    if (diameter > thickness * 2) {
      issues.push({
        type: "warning",
        title: "Transducer Too Large",
        message: `Transducer diameter (${diameter.toFixed(1)}mm) is more than 2x part thickness (${thickness}mm). May cause near-surface dead zone issues.`,
        reference: "MIL-STD-2154 Section 4.3"
      });
    }
  }

  // All checks passed
  if (issues.length === 0 && frequency && thickness && material && standard) {
    issues.push({
      type: "success",
      title: "All Validations Passed",
      message: "Configuration meets all standard requirements. No conflicts detected.",
      reference: standard
    });
  }

  if (issues.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "error": return <XCircle className="h-5 w-5" />;
      case "warning": return <AlertTriangle className="h-5 w-5" />;
      case "success": return <CheckCircle2 className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case "error": return "destructive";
      case "success": return "default";
      default: return "default";
    }
  };

  return (
    <div className="space-y-3">
      {issues.map((issue, index) => (
        <Alert 
          key={index} 
          variant={getVariant(issue.type)}
          className={
            issue.type === "warning" ? "border-warning bg-warning/10" :
            issue.type === "info" ? "border-primary bg-primary/10" :
            issue.type === "success" ? "border-success bg-success/10" :
            ""
          }
        >
          {getIcon(issue.type)}
          <AlertTitle className="ml-2">{issue.title}</AlertTitle>
          <AlertDescription className="ml-2">
            {issue.message}
            {issue.reference && (
              <div className="text-xs mt-2 font-medium opacity-80">
                Reference: {issue.reference}
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
