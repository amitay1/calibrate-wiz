import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Save, 
  Download, 
  CheckCircle, 
  FileSearch,
  Settings,
  Printer,
  RefreshCw
} from "lucide-react";

interface ToolbarProps {
  onSave: () => void;
  onExport: () => void;
  onValidate: () => void;
  reportMode: "Technique" | "Report";
  onReportModeChange: (mode: "Technique" | "Report") => void;
}

export const Toolbar = ({ 
  onSave, 
  onExport, 
  onValidate,
  reportMode,
  onReportModeChange 
}: ToolbarProps) => {
  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-2">
      {/* Quick Actions */}
      <Button variant="ghost" size="icon" onClick={onSave} title="Save (Ctrl+S)">
        <Save className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" onClick={onExport} title="Export PDF (Ctrl+E)">
        <Download className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" title="Print">
        <Printer className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-8 mx-1" />

      {/* Mode Selection */}
      <div className="flex gap-1 bg-muted p-1 rounded-md">
        <Button
          variant={reportMode === "Technique" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onReportModeChange("Technique")}
          className="h-8 text-xs font-medium"
        >
          <FileText className="h-3 w-3 mr-1" />
          Technique Sheet
        </Button>
        <Button
          variant={reportMode === "Report" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onReportModeChange("Report")}
          className="h-8 text-xs font-medium"
        >
          <FileSearch className="h-3 w-3 mr-1" />
          Inspection Report
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8 mx-1" />

      {/* Validation */}
      <Button variant="ghost" size="icon" onClick={onValidate} title="Validate Document">
        <CheckCircle className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      {/* Right Side Tools */}
      <Button variant="ghost" size="icon" title="Refresh">
        <RefreshCw className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" title="Settings">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};
