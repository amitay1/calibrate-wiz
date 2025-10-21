import React, { useState } from 'react';
import { FileText, Download, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { TUVTechnicalCard, TUVExportOptions } from '@/types/tuvTemplate';
import { exportTUVTemplateToPDF, convertTechniqueSheetToTUV } from '@/utils/tuvTemplateExport';
import { PartDrawingManager } from './PartDrawingManager';
import type { TechniqueSheet } from '@/types/techniqueSheet';

interface TUVExportPanelProps {
  techniqueSheet: TechniqueSheet;
  onExport?: () => void;
}

export const TUVExportPanel: React.FC<TUVExportPanelProps> = ({
  techniqueSheet,
  onExport,
}) => {
  const [exportOptionsOpen, setExportOptionsOpen] = useState(false);
  const [additionalDataOpen, setAdditionalDataOpen] = useState(false);
  const [partDrawing, setPartDrawing] = useState<any>(null);

  // Export options
  const [exportOptions, setExportOptions] = useState<TUVExportOptions>({
    includeTableOfContents: true,
    includeScanImages: true,
    includeReferenceDrawings: true,
    language: 'en',
    outputFormat: 'pdf',
  });

  // Additional TUV-specific data
  const [additionalData, setAdditionalData] = useState({
    documentNumber: '',
    labName: 'NDI Laboratory',
    labLocation: '',
    clientName: '',
    clientLocation: '',
    approvedBy: '',
    logoImage: '',
  });

  /**
   * Handle TUV export
   */
  const handleTUVExport = async () => {
    try {
      // Validate required fields
      if (!additionalData.documentNumber) {
        toast.error('Please enter a document number');
        setAdditionalDataOpen(true);
        return;
      }

      if (!additionalData.clientName) {
        toast.error('Please enter client name');
        setAdditionalDataOpen(true);
        return;
      }

      // Convert technique sheet to TUV format
      const tuvData: TUVTechnicalCard = convertTechniqueSheetToTUV(techniqueSheet, {
        ...additionalData,
        partDrawingImage: partDrawing?.imageData,
      });

      // Export to PDF
      exportTUVTemplateToPDF(tuvData, exportOptions);

      toast.success('TUV Technical Card exported successfully!');
      onExport?.();
      setExportOptionsOpen(false);
    } catch (error) {
      console.error('TUV export error:', error);
      toast.error('Failed to export TUV Technical Card');
    }
  };

  /**
   * Check if export is ready
   */
  const isExportReady = (): boolean => {
    return Boolean(
      additionalData.documentNumber &&
      additionalData.clientName &&
      techniqueSheet.inspectionSetup?.partNumber
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            TÜV Technical Card Export
          </CardTitle>
          <CardDescription>
            Export a professional 19-page technical card in TÜV SÜD / BYTEST format
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Part Drawing Section */}
          <PartDrawingManager
            onDrawingSelected={(drawing) => setPartDrawing(drawing)}
            currentDrawing={partDrawing}
          />

          {/* Additional Data Section */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                TUV-Specific Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">
                    Document Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="documentNumber"
                    placeholder="P03.00-066"
                    value={additionalData.documentNumber}
                    onChange={(e) =>
                      setAdditionalData({ ...additionalData, documentNumber: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">
                    Client Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="Company Name"
                    value={additionalData.clientName}
                    onChange={(e) =>
                      setAdditionalData({ ...additionalData, clientName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labName">Laboratory Name</Label>
                  <Input
                    id="labName"
                    placeholder="NDI Laboratory"
                    value={additionalData.labName}
                    onChange={(e) =>
                      setAdditionalData({ ...additionalData, labName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientLocation">Client Location</Label>
                  <Input
                    id="clientLocation"
                    placeholder="France"
                    value={additionalData.clientLocation}
                    onChange={(e) =>
                      setAdditionalData({ ...additionalData, clientLocation: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labLocation">Lab Location</Label>
                  <Input
                    id="labLocation"
                    placeholder="Italy"
                    value={additionalData.labLocation}
                    onChange={(e) =>
                      setAdditionalData({ ...additionalData, labLocation: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvedBy">Approved By</Label>
                  <Input
                    id="approvedBy"
                    placeholder="QA Manager Name"
                    value={additionalData.approvedBy}
                    onChange={(e) =>
                      setAdditionalData({ ...additionalData, approvedBy: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Status */}
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
            {isExportReady() ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Ready to export</span>
              </>
            ) : (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Please complete required fields (marked with *)
                </span>
              </>
            )}
          </div>

          {/* Export Button with Options */}
          <div className="flex gap-2">
            <Dialog open={exportOptionsOpen} onOpenChange={setExportOptionsOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1" disabled={!isExportReady()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export TUV Technical Card
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Options</DialogTitle>
                  <DialogDescription>
                    Configure export settings for your TUV Technical Card
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Include options */}
                  <div className="space-y-3">
                    <Label>Include in Export:</Label>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeToC"
                        checked={exportOptions.includeTableOfContents}
                        onCheckedChange={(checked) =>
                          setExportOptions({
                            ...exportOptions,
                            includeTableOfContents: checked as boolean,
                          })
                        }
                      />
                      <label
                        htmlFor="includeToC"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Table of Contents
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeScanImages"
                        checked={exportOptions.includeScanImages}
                        onCheckedChange={(checked) =>
                          setExportOptions({
                            ...exportOptions,
                            includeScanImages: checked as boolean,
                          })
                        }
                      />
                      <label
                        htmlFor="includeScanImages"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Scan Images (C-Scan, A-Scan)
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeRefDrawings"
                        checked={exportOptions.includeReferenceDrawings}
                        onCheckedChange={(checked) =>
                          setExportOptions({
                            ...exportOptions,
                            includeReferenceDrawings: checked as boolean,
                          })
                        }
                      />
                      <label
                        htmlFor="includeRefDrawings"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Reference Standard Drawings
                      </label>
                    </div>
                  </div>

                  {/* Language selection */}
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={exportOptions.language}
                      onValueChange={(value: any) =>
                        setExportOptions({ ...exportOptions, language: value })
                      }
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="bilingual">Bilingual (EN/IT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Output format */}
                  <div className="space-y-2">
                    <Label htmlFor="outputFormat">Output Format</Label>
                    <Select
                      value={exportOptions.outputFormat}
                      onValueChange={(value: any) =>
                        setExportOptions({ ...exportOptions, outputFormat: value })
                      }
                    >
                      <SelectTrigger id="outputFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="pdf-a">PDF/A (Archival)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setExportOptionsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleTUVExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() =>
                toast.info('Preview feature coming soon')
              }
            >
              Preview
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">TUV Technical Card includes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Cover page with document header and part information</li>
              <li>Table of contents (Page 2)</li>
              <li>Part drawings with colored scan zones (Pages 4-7)</li>
              <li>Equipment and probe details (Pages 8-9)</li>
              <li>Calibration parameters with FBH specifications (Pages 10-11)</li>
              <li>Scan parameters and settings (Pages 12-13)</li>
              <li>Acceptance criteria per standard (Pages 14-15)</li>
              <li>Reference standard drawings (Pages 16-17)</li>
              <li>Calibration data tables and QA signatures (Pages 18-19)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
