import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScanParametersData } from "@/types/techniqueSheet";
import { FieldWithHelp } from "@/components/FieldWithHelp";

interface ScanParametersTabProps {
  data: ScanParametersData;
  onChange: (data: ScanParametersData) => void;
  standard: string;
}

export const ScanParametersTab = ({ data, onChange, standard }: ScanParametersTabProps) => {
  const updateField = (field: keyof ScanParametersData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const maxScanSpeed = standard === "AMS-STD-2154E" ? 150 : 200;
  const showWaterPath = data.scanMethod === "immersion";

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWithHelp
          label="Scan Method"
          help="Method of ultrasonic coupling per Section 5.4"
          required
          fieldKey="scanMethod"
        >
          <Select
            value={data.scanMethod}
            onValueChange={(value) => updateField("scanMethod", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select method..." />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="immersion">Immersion</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="squirter">Squirter</SelectItem>
            </SelectContent>
          </Select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Scan Type"
          help="Level of automation"
          required
          fieldKey="scanType"
        >
          <Select
            value={data.scanType}
            onValueChange={(value) => updateField("scanType", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="semi_automated">Semi-Automated</SelectItem>
              <SelectItem value="fully_automated">Fully Automated</SelectItem>
            </SelectContent>
          </Select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Scan Speed (mm/s)"
          help={`Maximum ${maxScanSpeed}mm/s per standard`}
          required
          fieldKey="scanSpeed"
        >
          <Input
            type="number"
            value={data.scanSpeed}
            onChange={(e) => updateField("scanSpeed", parseFloat(e.target.value) || 0)}
            min={1}
            max={maxScanSpeed}
            className="bg-background"
          />
          {data.scanSpeed > maxScanSpeed && (
            <p className="text-xs text-destructive mt-1">
              Exceeds maximum of {maxScanSpeed}mm/s per {standard}
            </p>
          )}
        </FieldWithHelp>

        <FieldWithHelp
          label="Scan Index (% of beam width)"
          help="Spacing between scan lines - maximum 70% per Section 5.4.12"
          required
          fieldKey="scanIndex"
        >
          <Input
            type="number"
            value={data.scanIndex}
            onChange={(e) => updateField("scanIndex", parseFloat(e.target.value) || 0)}
            min={1}
            max={70}
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Coverage (%)"
          help="Must be 100% per Section 5.4.2"
          required
          fieldKey="coverage"
        >
          <Input
            type="number"
            value={data.coverage}
            onChange={(e) => updateField("coverage", parseFloat(e.target.value) || 0)}
            min={100}
            max={100}
            disabled
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Scan Pattern"
          help="Path pattern for coverage"
          required
          fieldKey="scanPattern"
        >
          <Select
            value={data.scanPattern}
            onValueChange={(value) => updateField("scanPattern", value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select pattern..." />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="raster">Raster</SelectItem>
              <SelectItem value="spiral">Spiral</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </FieldWithHelp>

        {showWaterPath && (
          <FieldWithHelp
            label="Water Path (mm)"
            help="Distance between transducer and part surface"
            fieldKey="waterPath"
          >
            <Input
              type="number"
              value={data.waterPath || 0}
              onChange={(e) => updateField("waterPath", parseFloat(e.target.value) || 0)}
              min={0}
              className="bg-background"
            />
          </FieldWithHelp>
        )}

        <FieldWithHelp
          label="Pulse Repetition Rate (Hz)"
          help="PRF setting"
          fieldKey="pulseRepetitionRate"
        >
          <Input
            type="number"
            value={data.pulseRepetitionRate}
            onChange={(e) => updateField("pulseRepetitionRate", parseFloat(e.target.value) || 0)}
            min={100}
            max={10000}
            className="bg-background"
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Gain Settings (dB)"
          help="Gain used during inspection"
          fieldKey="gainSettings"
        >
          <Input
            value={data.gainSettings}
            onChange={(e) => updateField("gainSettings", e.target.value)}
            placeholder="45 dB"
            className="bg-background"
          />
        </FieldWithHelp>
      </div>

      <FieldWithHelp
        label="Alarm/Gate Settings"
        help="Description of gate positions and alarm levels per Section 5.2.3"
        fieldKey="alarmGateSettings"
      >
        <Textarea
          value={data.alarmGateSettings}
          onChange={(e) => updateField("alarmGateSettings", e.target.value)}
          placeholder="Describe gate positions, alarm levels, and trigger settings..."
          rows={4}
          className="bg-background"
        />
      </FieldWithHelp>
    </div>
  );
};
