import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import beamDirectionsExample from "@/assets/scan-diagrams/beam-directions-example.jpg";

export interface ScanDetail {
  scanningDirection: string;
  waveMode: string;
  frequency: string;
  make: string;
  probe: string;
  remarkDetails: string;
}

export interface ScanDetailsData {
  scanDetails: ScanDetail[];
}

interface ScanDetailsTabProps {
  data: ScanDetailsData;
  onChange: (data: ScanDetailsData) => void;
  partType?: string;
}

const WAVE_MODES = [
  "Longitudinal",
  "Longitudinal (Axial)",
  "Axial shear wave 45° OD",
  "Shear wave 45° clockwise",
  "Shear wave 45° counter clockwise",
  "Circumferential shear wave"
];

const SCAN_DIRECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "L"];

const DEFAULT_SCAN_DETAILS: ScanDetail[] = [
  { scanningDirection: "A", waveMode: "Longitudinal", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "B", waveMode: "Longitudinal", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "C", waveMode: "Longitudinal", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "D", waveMode: "Longitudinal", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "E", waveMode: "Axial shear wave 45° OD", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "F", waveMode: "Axial shear wave 45° OD", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "G", waveMode: "Shear wave 45° clockwise", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "H", waveMode: "Shear wave 45° counter clockwise", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "I", waveMode: "Shear wave 45° counter clockwise", frequency: "", make: "", probe: "", remarkDetails: "" },
  { scanningDirection: "L", waveMode: "Shear wave 45° counter clockwise", frequency: "", make: "", probe: "", remarkDetails: "" }
];

export const ScanDetailsTab = ({ data, onChange, partType }: ScanDetailsTabProps) => {
  // Initialize with default scan details if empty
  useEffect(() => {
    if (!data?.scanDetails || data.scanDetails.length === 0) {
      onChange({ scanDetails: DEFAULT_SCAN_DETAILS });
    }
  }, []);

  const updateScanDetail = (index: number, field: keyof ScanDetail, value: string) => {
    const newScanDetails = [...data.scanDetails];
    newScanDetails[index] = { ...newScanDetails[index], [field]: value };
    onChange({ scanDetails: newScanDetails });
  };

  const getDiagramForPartType = () => {
    if (!partType) return null;
    
    const partTypeLower = partType.toLowerCase();
    
    // Show ring forging specific diagram
    if (partTypeLower.includes("ring")) {
      return {
        image: beamDirectionsExample,
        title: "Ring Forging - Scan Directions (כיווני סריקה)",
        notes: [
          "Direzione fascio (0°, onde longitudinali) - Beam direction (0°, longitudinal waves)",
          "Direzione fascio (45°, onde trasversali assiali) - Beam direction (45°, axial shear waves)",
          "Scan with straight beam from circumference with sound beam directed radially if thickness ≤ 20% of OD",
          "Axial scanning required only if L/T < 5",
          "Circumferential shear wave technique required per Appendix A"
        ]
      };
    }
    
    // Show disk forging diagram
    if (partTypeLower.includes("disk")) {
      return {
        image: beamDirectionsExample,
        title: "Disk Forging - Scan Directions (כיווני סריקה)",
        notes: [
          "Scan with straight beams from at least one flat face",
          "Scan radially from circumference whenever practical",
          "Reference diagram shows longitudinal and shear wave directions"
        ]
      };
    }
    
    // Show hex bar diagram
    if (partTypeLower.includes("hex")) {
      return {
        image: beamDirectionsExample,
        title: "Hex Bar - Scan Directions (כיווני סריקה)",
        notes: [
          "Scan with straight beam from three adjacent faces",
          "When T exceeds attenuation limits, scan from opposite sides",
          "Reference diagram shows various beam angles and directions"
        ]
      };
    }
    
    // Default overview for other shapes
    return {
      image: beamDirectionsExample,
      title: "Sound Beam Directions - Reference Diagram (תרשים כיווני קרן קול)",
      notes: [
        "Select appropriate scanning directions based on part geometry",
        "Follow MIL-STD-2154 guidelines for coverage requirements",
        "Diagram shows SIDE A and SIDE B beam directions with longitudinal (0°) and shear wave (45°) angles"
      ]
    };
  };

  const diagram = getDiagramForPartType();

  return (
    <div className="space-y-6">
      {/* Diagram Section */}
      {diagram && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{diagram.title}</h3>
              <Badge variant="secondary">Reference</Badge>
            </div>
            
            {/* Diagram Image */}
            <div className="bg-muted/30 p-4 rounded-lg border-2 border-primary/20">
              <img 
                src={diagram.image} 
                alt={diagram.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <p className="text-xs text-center text-muted-foreground mt-2">
                תרשים כיווני סריקה - Beam Direction Reference Diagram
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Important Notes (הערות חשובות):
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {diagram.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Scan Details Table */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Scan Details Configuration</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Configure scanning parameters for each direction according to part geometry and inspection requirements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold text-sm">Direction</th>
                  <th className="text-left p-2 font-semibold text-sm">Wave Mode</th>
                  <th className="text-left p-2 font-semibold text-sm">Frequency (MHz)</th>
                  <th className="text-left p-2 font-semibold text-sm">Make</th>
                  <th className="text-left p-2 font-semibold text-sm">Probe</th>
                  <th className="text-left p-2 font-semibold text-sm">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {data.scanDetails?.map((detail, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Badge variant="outline" className="font-mono">
                        {detail.scanningDirection}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Select
                        value={detail.waveMode}
                        onValueChange={(value) => updateScanDetail(index, "waveMode", value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WAVE_MODES.map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={detail.frequency}
                        onChange={(e) => updateScanDetail(index, "frequency", e.target.value)}
                        placeholder="e.g., 5.0"
                        className="h-9"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={detail.make}
                        onChange={(e) => updateScanDetail(index, "make", e.target.value)}
                        placeholder="Manufacturer"
                        className="h-9"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={detail.probe}
                        onChange={(e) => updateScanDetail(index, "probe", e.target.value)}
                        placeholder="Probe model"
                        className="h-9"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={detail.remarkDetails}
                        onChange={(e) => updateScanDetail(index, "remarkDetails", e.target.value)}
                        placeholder="Additional notes"
                        className="h-9"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
            💡 <strong>Tip:</strong> Scanning directions are labeled A through L. Configure only the directions required for your part geometry. Leave unused rows empty.
          </div>
        </div>
      </Card>
    </div>
  );
};
