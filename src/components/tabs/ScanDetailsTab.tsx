import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Info, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScanDirectionVisualizer, type ScanVisualization } from "@/components/ScanDirectionVisualizer";
import ColoredScanDrawing from "@/components/ColoredScanDrawing";

export interface ScanDetail {
  scanningDirection: string;
  waveMode: string;
  frequency: string;
  make: string;
  probe: string;
  remarkDetails: string;
  isVisible?: boolean; // Controls 3D visualization display
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
  { scanningDirection: "A", waveMode: "Longitudinal", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "B", waveMode: "Longitudinal", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "C", waveMode: "Longitudinal", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "D", waveMode: "Longitudinal", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "E", waveMode: "Axial shear wave 45° OD", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "F", waveMode: "Axial shear wave 45° OD", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "G", waveMode: "Shear wave 45° clockwise", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "H", waveMode: "Shear wave 45° counter clockwise", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "I", waveMode: "Shear wave 45° counter clockwise", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false },
  { scanningDirection: "L", waveMode: "Shear wave 45° counter clockwise", frequency: "", make: "", probe: "", remarkDetails: "", isVisible: false }
];

export const ScanDetailsTab = ({ data, onChange, partType }: ScanDetailsTabProps) => {
  // Initialize with default scan details if empty
  useEffect(() => {
    if (!data?.scanDetails || data.scanDetails.length === 0) {
      onChange({ scanDetails: DEFAULT_SCAN_DETAILS });
    }
  }, []);

  const updateScanDetail = (index: number, field: keyof ScanDetail, value: string | boolean) => {
    const newScanDetails = [...data.scanDetails];
    newScanDetails[index] = { ...newScanDetails[index], [field]: value };
    onChange({ scanDetails: newScanDetails });
  };

  const toggleVisibility = (index: number) => {
    updateScanDetail(index, 'isVisible', !data.scanDetails[index].isVisible);
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
      {/* Color-Coded Scan Coverage Visualization */}
      {partType && data.scanDetails.length > 0 && (
        <ColoredScanDrawing
          partType={partType}
          dimensions={{
            outerDiameter: 640,
            innerDiameter: 478,
            wallThickness: 81,
            length: 736
          }}
          scans={data.scanDetails.map(detail => ({
            id: detail.scanningDirection,
            name: detail.scanningDirection,
            waveType: detail.waveMode,
            beamAngle: detail.waveMode.includes('45') ? 45 : 
                       detail.waveMode.includes('60') ? 60 :
                       detail.waveMode.includes('70') ? 70 : 0,
            side: 'A', // Default to side A, can be enhanced later
          }))}
        />
      )}

      {/* Scan Direction Visualizer */}
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
                  <th className="text-center p-2 font-semibold text-sm w-[80px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex flex-col items-center gap-1 cursor-help">
                            <Eye className="h-4 w-4 text-primary" />
                            <span className="text-xs">Show 3D</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">Check to visualize this scan direction on the 3D model</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
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
                  <tr 
                    key={index} 
                    className={`border-b hover:bg-muted/50 transition-all ${
                      detail.isVisible ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Checkbox
                                checked={detail.isVisible || false}
                                onCheckedChange={() => toggleVisibility(index)}
                                className="h-5 w-5"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Toggle 3D visualization for this scan direction</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                    <td className="p-2">
                      <Badge 
                        variant="outline" 
                        className={`font-mono ${detail.isVisible ? 'border-primary text-primary' : ''}`}
                      >
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

          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg space-y-1">
            <p>💡 <strong>Tip:</strong> Scanning directions are labeled A through L. Configure only the directions required for your part geometry.</p>
            <p>🎯 <strong>3D Visualization:</strong> Check the boxes to see scan directions displayed on the 3D model in real-time.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
