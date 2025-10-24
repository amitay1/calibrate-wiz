import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScanDirectionVisualizer, type ScanVisualization } from "@/components/ScanDirectionVisualizer";

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

  // Convert scan details to visualization format
  const scanVisualizations: ScanVisualization[] = data.scanDetails.map(detail => {
    // Parse wave mode to determine scan mode
    let mode: ScanVisualization['mode'] = 'Longitudinal0';
    if (detail.waveMode.toLowerCase().includes('shear') || detail.waveMode.toLowerCase().includes('angle')) {
      if (detail.waveMode.includes('45')) mode = 'Shear45';
      else if (detail.waveMode.includes('60')) mode = 'Shear60';
      else if (detail.waveMode.includes('70')) mode = 'Shear70';
    }
    
    // Parse scanning direction to determine path
    let path: ScanVisualization['path'] = 'Radial';
    let side: ScanVisualization['side'] = 'A';
    let direction: ScanVisualization['direction'] = 'None';
    
    const dirLower = detail.scanningDirection.toLowerCase();
    if (dirLower.includes('circumferential') || dirLower.includes('circ')) {
      path = 'Circumferential';
      if (dirLower.includes('cw') || dirLower.includes('clockwise')) direction = 'CW';
      if (dirLower.includes('ccw') || dirLower.includes('counter')) direction = 'CCW';
    } else if (dirLower.includes('axial') || dirLower.includes('length')) {
      path = 'Axial';
    } else if (dirLower.includes('radial') || dirLower.includes('od') || dirLower.includes('id')) {
      path = 'Radial';
    } else if (dirLower.includes('helix') || dirLower.includes('spiral')) {
      path = 'Helix';
      if (dirLower.includes('cw')) direction = 'CW';
      if (dirLower.includes('ccw')) direction = 'CCW';
    }
    
    if (dirLower.includes('side b') || dirLower.includes('b direction')) side = 'B';
    
    return {
      scanningDirection: detail.scanningDirection,
      waveMode: detail.waveMode,
      mode,
      path,
      side,
      direction
    };
  });

  return (
    <div className="space-y-6">
      {/* Visualization */}
      {partType && data.scanDetails.length > 0 && (
        <ScanDirectionVisualizer
          partType={partType}
          dimensions={{
            outerDiameter: 640,
            innerDiameter: 478,
            length: 736
          }}
          scans={scanVisualizations}
        />
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
