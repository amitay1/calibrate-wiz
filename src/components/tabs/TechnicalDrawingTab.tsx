import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileImage, FileText, Box, Layout } from 'lucide-react';
import { RealTimeTechnicalDrawing } from '@/components/RealTimeTechnicalDrawing';
import { ScanCoverage3DViewer } from '@/components/ScanCoverage3DViewer';
import { PartGeometry, MaterialType } from '@/types/techniqueSheet';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { getScanZonesForPartType } from '@/utils/scanZoneMapper';
import { Badge } from '@/components/ui/badge';
import { calculateDepthZones } from '@/utils/technicalDrawings/advancedScanCoverage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TechnicalDrawingTabProps {
  partType: PartGeometry;
  dimensions: {
    length: number;
    width: number;
    thickness: number;
    diameter?: number;
    isHollow?: boolean;
    innerDiameter?: number;
    innerLength?: number;
    innerWidth?: number;
    wallThickness?: number;
  };
  material?: MaterialType;
  scans?: Array<{
    id: string;
    name: string;
    waveType: string;
    beamAngle: number;
    side: 'A' | 'B';
  }>;
}

export const TechnicalDrawingTab = ({
  partType,
  dimensions,
  material,
  scans = [],
}: TechnicalDrawingTabProps) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  // Calculate scan coverage
  const scanCoverage = useMemo(() => {
    return getScanZonesForPartType(
      partType,
      scans,
      dimensions
    );
  }, [partType, dimensions, scans]);
  
  // Calculate 3D depth zones
  const depthZones3D = useMemo(() => {
    if (scans.length === 0) return [];
    
    const waveType: 'longitudinal' | 'shear' = 
      scans[0]?.waveType?.toLowerCase().includes('shear') || 
      scans[0]?.waveType?.toLowerCase().includes('transverse') || 
      scans[0]?.beamAngle > 0 
        ? 'shear' 
        : 'longitudinal';
    
    return calculateDepthZones(
      waveType,
      scans[0]?.beamAngle || 0,
      5, // Default 5MHz frequency
      dimensions.thickness || dimensions.diameter || 50
    );
  }, [scans, dimensions]);

  const handleExportSVG = () => {
    toast.info('SVG export will be available soon');
  };

  const handleExportDXF = () => {
    toast.info('DXF export will be available soon');
  };

  const handleExportPDF = () => {
    toast.info('PDF export will be available soon');
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `technical-drawing-${partType}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('PNG exported successfully!');
    } else {
      toast.error('No drawing to export');
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-semibold">Technical Drawing</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-view technical drawing (ISO 128 compliant)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleExportPNG} 
            variant="outline"
            size="sm"
          >
            <FileImage className="w-4 h-4 mr-2" />
            Export PNG
          </Button>
          <Button 
            onClick={handleExportSVG} 
            variant="outline"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export SVG
          </Button>
          <Button 
            onClick={handleExportDXF} 
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export DXF
          </Button>
        </div>
      </div>

      {/* View Mode Selector */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as '2d' | '3d')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="2d" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            2D Multi-View
          </TabsTrigger>
          <TabsTrigger value="3d" className="flex items-center gap-2">
            <Box className="w-4 h-4" />
            3D Scan Coverage
          </TabsTrigger>
        </TabsList>

        {/* 2D View */}
        <TabsContent value="2d" className="mt-4">
          <Card className="p-6">
            <div className="w-full" style={{ height: '650px' }}>
              <RealTimeTechnicalDrawing
                partType={partType}
                dimensions={dimensions}
                material={material}
                scans={scans}
                viewMode="multi"
                showGrid={true}
                showDimensions={true}
              />
            </div>
          </Card>
        </TabsContent>

        {/* 3D View */}
        <TabsContent value="3d" className="mt-4">
          <Card className="p-6">
            <div className="w-full" style={{ height: '650px' }}>
              <ScanCoverage3DViewer
                partType={partType}
                dimensions={dimensions}
                scans={scans}
                depthZones={depthZones3D}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Dimensions</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>Length: {dimensions.length}mm</p>
            <p>Width: {dimensions.width}mm</p>
            <p>Thickness: {dimensions.thickness}mm</p>
            {dimensions.diameter && <p>Outer Diameter: Ø{dimensions.diameter}mm</p>}
            {dimensions.innerDiameter && (
              <>
                <p>Inner Diameter: Ø{dimensions.innerDiameter}mm</p>
                <p>Wall Thickness: {dimensions.wallThickness?.toFixed(2)}mm</p>
              </>
            )}
            {dimensions.innerLength && dimensions.innerWidth && (
              <>
                <p>Inner Length: {dimensions.innerLength}mm</p>
                <p>Inner Width: {dimensions.innerWidth}mm</p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Part Information</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>Type: {partType.toUpperCase()}</p>
            {material && <p>Material: {material}</p>}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-2">Drawing Standard</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>Standard: ISO 128</p>
            <p>Views: Front, Top, Side, Isometric</p>
            <p>Line Types: Visible, Hidden, Center, Dimension</p>
          </div>
        </Card>
      </div>

      {/* Scan Coverage Analysis */}
      {scans.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Scan Coverage Analysis</h4>
            <Badge 
              variant={scanCoverage.totalCoverage >= 95 ? "default" : scanCoverage.totalCoverage >= 80 ? "secondary" : "destructive"}
              className="text-base px-3 py-1"
            >
              {scanCoverage.totalCoverage.toFixed(1)}% Coverage
            </Badge>
          </div>

          {/* Scan Zones */}
          <div className="space-y-3 mb-4">
            {scanCoverage.zones.map((zone, index) => (
              <div key={zone.scanId} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                <div 
                  className="w-12 h-12 rounded border-2 border-border flex-shrink-0"
                  style={{ backgroundColor: zone.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{zone.scanId}</span>
                    <Badge variant="outline" className="text-xs">
                      {zone.waveType === 'longitudinal' ? 'L-Wave' : 'S-Wave'} @ {zone.beamAngle}°
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Side {zone.side}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Depth: {zone.depthRange.start.toFixed(1)}mm - {zone.depthRange.end.toFixed(1)}mm
                    <span className="mx-2">•</span>
                    Coverage: {zone.coverage.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Uncovered Areas Warning */}
          {scanCoverage.uncoveredAreas.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <h5 className="font-semibold text-destructive mb-2">⚠️ Uncovered Areas Detected</h5>
              <div className="space-y-1 text-sm text-destructive">
                {scanCoverage.uncoveredAreas.map((area, index) => (
                  <div key={index}>
                    • Depth range {area.start.toFixed(1)}mm - {area.end.toFixed(1)}mm is not covered
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Line Standards (ISO 128)</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-black"></div>
            <span className="text-sm text-muted-foreground">Visible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 border-t-2 border-dashed border-gray-500"></div>
            <span className="text-sm text-muted-foreground">Hidden</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 border-t border-dashed border-blue-500"></div>
            <span className="text-sm text-muted-foreground">Center</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-red-500"></div>
            <span className="text-sm text-muted-foreground">Dimension</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-2 bg-gray-300" style={{ 
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #666 2px, #666 3px)' 
            }}></div>
            <span className="text-sm text-muted-foreground">Section</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
