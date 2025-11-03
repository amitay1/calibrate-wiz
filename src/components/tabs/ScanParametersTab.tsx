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
          fieldKey="scan_params.scan_method"
          required
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
          fieldKey="scan_params.scan_type"
          required
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
          fieldKey="scan_params.scan_speed"
          required
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
          fieldKey="scan_params.scan_index"
          required
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
          fieldKey="scan_params.coverage"
          required
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
          fieldKey="scan_params.scan_pattern"
          required
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
            fieldKey="scan_params.water_path"
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
          fieldKey="scan_params.pulse_repetition_rate"
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
          fieldKey="scan_params.gain_settings"
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
        fieldKey="scan_params.alarm_gate_settings"
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
