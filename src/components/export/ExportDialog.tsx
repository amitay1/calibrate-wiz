import { useState } from 'react';
import { FileText, FileType, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EXPORT_TEMPLATES } from '@/config/exportTemplates';
import type { ExportFormat, ExportTemplate } from '@/types/exportTemplates';
import type { TechniqueSheetData } from '@/types/techniqueSheet';
import { WordExporter } from '@/utils/exporters/wordExporter';
import { exportTechniqueSheetToPDF } from '@/utils/techniqueSheetExport';
import { toast } from 'sonner';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TechniqueSheetData;
}

export function ExportDialog({ open, onOpenChange, data }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate>(EXPORT_TEMPLATES[1]); // Standard
  const [include3DViews, setInclude3DViews] = useState(false);
  const [includeCalibrationDrawings, setIncludeCalibrationDrawings] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportOptions = {
        format: selectedFormat,
        template: selectedTemplate,
        include3DViews,
        includeCalibrationDrawings,
        includeSignatures,
        documentNumber,
      };

      if (selectedFormat === 'pdf') {
        // Use existing PDF export for now
        const exportData = {
          standard: data.standardName,
          inspectionSetup: data.inspectionSetup || {},
          equipment: data.equipment || {},
          calibration: data.calibration || {},
          scanParameters: data.scanParameters || {},
          acceptanceCriteria: data.acceptanceCriteria || {},
          documentation: data.documentation || {},
        };
        exportTechniqueSheetToPDF(exportData as any);
        toast.success('PDF exported successfully');
      } else if (selectedFormat === 'docx') {
        const exporter = new WordExporter(data, exportOptions);
        const result = await exporter.export();
        
        if (result.success) {
          toast.success('Word document exported successfully');
        } else {
          toast.error(result.error || 'Export failed');
        }
      } else {
        toast.info('HTML export coming soon');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export document');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Technique Sheet</DialogTitle>
          <DialogDescription>
            Choose format, template, and export options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
            <RadioGroup value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ExportFormat)}>
              <div className="grid grid-cols-3 gap-4">
                <Card className={selectedFormat === 'pdf' ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="format-pdf" />
                      <Label htmlFor="format-pdf" className="cursor-pointer flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        PDF
                      </Label>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Professional, print-ready
                  </CardContent>
                </Card>

                <Card className={selectedFormat === 'docx' ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="docx" id="format-docx" />
                      <Label htmlFor="format-docx" className="cursor-pointer flex items-center gap-2">
                        <FileType className="h-5 w-5" />
                        Word
                      </Label>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Editable document
                  </CardContent>
                </Card>

                <Card className={selectedFormat === 'html' ? 'border-primary' : ''} style={{ opacity: 0.5 }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="html" id="format-html" disabled />
                      <Label htmlFor="format-html" className="cursor-not-allowed flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        HTML
                      </Label>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Coming soon
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Template</Label>
            <RadioGroup 
              value={selectedTemplate.id} 
              onValueChange={(id) => {
                const template = EXPORT_TEMPLATES.find(t => t.id === id);
                if (template) setSelectedTemplate(template);
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                {EXPORT_TEMPLATES.map((template) => (
                  <Card key={template.id} className={selectedTemplate.id === template.id ? 'border-primary' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={template.id} id={`template-${template.id}`} />
                        <Label htmlFor={`template-${template.id}`} className="cursor-pointer">
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                        </Label>
                      </div>
                      <CardDescription className="text-xs">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      {template.sections.length} sections • {template.layout.orientation}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-3d" 
                  checked={include3DViews}
                  onCheckedChange={(checked) => setInclude3DViews(checked as boolean)}
                />
                <Label htmlFor="include-3d" className="cursor-pointer">
                  Include 3D views
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-calibration" 
                  checked={includeCalibrationDrawings}
                  onCheckedChange={(checked) => setIncludeCalibrationDrawings(checked as boolean)}
                />
                <Label htmlFor="include-calibration" className="cursor-pointer">
                  Include calibration block drawings
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-signatures" 
                  checked={includeSignatures}
                  onCheckedChange={(checked) => setIncludeSignatures(checked as boolean)}
                />
                <Label htmlFor="include-signatures" className="cursor-pointer">
                  Add signature fields
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-number">Document Number (Optional)</Label>
                <Input
                  id="doc-number"
                  placeholder="e.g., UT-TS-2025-001"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
