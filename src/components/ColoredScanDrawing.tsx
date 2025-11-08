/**
 * Colored Scan Drawing Component
 * 
 * Renders technical drawings with color-coded scan zones showing
 * which scans cover which depth ranges of the material.
 */

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getScanZonesForPartType, ScanZone, SCAN_ZONE_COLORS } from '@/utils/scanZoneMapper';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ColoredScanDrawingProps {
  partType: string;
  dimensions: {
    diameter?: number;
    outerDiameter?: number;
    innerDiameter?: number;
    thickness?: number;
    wallThickness?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  scans: Array<{
    id: string;
    name: string;
    waveType: string;
    beamAngle: number;
    side: 'A' | 'B';
    steppingDirection?: string;
  }>;
}

export default function ColoredScanDrawing({
  partType,
  dimensions,
  scans,
}: ColoredScanDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanCoverage, setScanCoverage] = useState<any>(null);

  useEffect(() => {
    if (!canvasRef.current || scans.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scan zones
    const coverage = getScanZonesForPartType(partType, scans, dimensions);
    setScanCoverage(coverage);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw based on part type
    if (partType.toLowerCase().includes('tube') || partType.toLowerCase().includes('hollow')) {
      drawHollowCylinderWithZones(ctx, coverage.zones, dimensions);
    } else if (partType.toLowerCase().includes('cylinder')) {
      drawSolidCylinderWithZones(ctx, coverage.zones, dimensions);
    } else {
      drawPlateWithZones(ctx, coverage.zones, dimensions);
    }
  }, [partType, scans, dimensions]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scan Coverage Visualization</span>
          {scanCoverage && (
            <Badge variant={scanCoverage.totalCoverage >= 95 ? "default" : "destructive"}>
              {scanCoverage.totalCoverage.toFixed(1)}% Coverage
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas for drawing */}
        <div className="border rounded-lg p-4 bg-background">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Coverage warnings */}
        {scanCoverage && scanCoverage.uncoveredAreas.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Uncovered Areas Detected:</strong> {scanCoverage.uncoveredAreas.length} depth zone(s) 
              not covered by any scan. Consider adding additional scans.
            </AlertDescription>
          </Alert>
        )}

        {scanCoverage && scanCoverage.totalCoverage >= 95 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Full Coverage Achieved:</strong> All depth zones are covered by the scan plan.
            </AlertDescription>
          </Alert>
        )}

        {/* Scan Legend */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4" />
            Scan Zone Legend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {scanCoverage?.zones.map((zone: ScanZone) => (
              <div
                key={zone.scanId}
                className="flex items-center gap-2 p-2 rounded border"
              >
                <div
                  className="w-6 h-6 rounded border-2 border-border"
                  style={{ 
                    background: `repeating-linear-gradient(45deg, ${zone.color}, ${zone.color} 10px, ${zone.color}dd 10px, ${zone.color}dd 20px)`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{zone.scanId}</div>
                  <div className="text-xs text-muted-foreground">
                    {zone.waveType} • {zone.beamAngle}° • Side {zone.side}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Depth: {zone.depthRange.start.toFixed(1)} - {zone.depthRange.end.toFixed(1)} mm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Notes */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
          <p><strong>Note:</strong> Color bands represent the approximate depth coverage of each scan based on:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Wave type (longitudinal, shear, angle)</li>
            <li>Beam angle and direction</li>
            <li>Material thickness and acoustic properties</li>
            <li>Probe characteristics and frequency</li>
          </ul>
          <p className="mt-2">
            Colors are for visualization purposes. Actual penetration depth depends on material properties, 
            equipment settings, and operator technique.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Draw hollow cylinder with colored scan zones
 */
function drawHollowCylinderWithZones(
  ctx: CanvasRenderingContext2D,
  zones: ScanZone[],
  dimensions: any
) {
  const centerX = 400;
  const centerY = 300;
  const scale = 2;
  
  const outerRadius = ((dimensions.outerDiameter || dimensions.diameter || 100) / 2) * scale;
  const innerRadius = (dimensions.innerDiameter || outerRadius * 0.75) / 2 * scale;
  const wallThickness = outerRadius - innerRadius;
  
  // Draw background (material)
  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw scan zones as colored rings
  zones.forEach(zone => {
    const startRadius = innerRadius + (zone.depthRange.start / (dimensions.wallThickness || wallThickness / scale)) * wallThickness;
    const endRadius = innerRadius + (zone.depthRange.end / (dimensions.wallThickness || wallThickness / scale)) * wallThickness;
    
    // Create gradient for depth effect
    const gradient = ctx.createRadialGradient(centerX, centerY, startRadius, centerX, centerY, endRadius);
    gradient.addColorStop(0, zone.color + 'dd');
    gradient.addColorStop(1, zone.color + '88');
    
    // Draw zone ring
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, endRadius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, startRadius, 0, Math.PI * 2, true);
    ctx.fill();
    
    // Add hatching pattern for clarity
    drawHatching(ctx, centerX, centerY, startRadius, endRadius, zone.color);
  });
  
  // Draw inner hole
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw outlines
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Add dimension lines
  drawDimensionLine(ctx, centerX, centerY - outerRadius - 30, centerX, centerY - outerRadius - 10, 
    `OD: ${dimensions.outerDiameter || dimensions.diameter || 100} mm`);
  drawDimensionLine(ctx, centerX, centerY + innerRadius + 10, centerX, centerY + innerRadius + 30,
    `ID: ${dimensions.innerDiameter || (dimensions.diameter || 100) * 0.75} mm`);
  
  // Add centerlines
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(centerX - outerRadius - 20, centerY);
  ctx.lineTo(centerX + outerRadius + 20, centerY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - outerRadius - 20);
  ctx.lineTo(centerX, centerY + outerRadius + 20);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw solid cylinder with colored scan zones
 */
function drawSolidCylinderWithZones(
  ctx: CanvasRenderingContext2D,
  zones: ScanZone[],
  dimensions: any
) {
  const centerX = 400;
  const centerY = 300;
  const scale = 2;
  const radius = ((dimensions.diameter || 100) / 2) * scale;
  
  // Draw scan zones as colored circles
  zones.forEach(zone => {
    const startRadius = (zone.depthRange.start / (dimensions.diameter / 2 || 50)) * radius;
    const endRadius = (zone.depthRange.end / (dimensions.diameter / 2 || 50)) * radius;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, startRadius, centerX, centerY, endRadius);
    gradient.addColorStop(0, zone.color + 'dd');
    gradient.addColorStop(1, zone.color + '88');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    if (startRadius > 0) {
      ctx.arc(centerX, centerY, endRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, startRadius, 0, Math.PI * 2, true);
    } else {
      ctx.arc(centerX, centerY, endRadius, 0, Math.PI * 2);
    }
    ctx.fill();
  });
  
  // Draw outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Draw flat plate with colored scan zones
 */
function drawPlateWithZones(
  ctx: CanvasRenderingContext2D,
  zones: ScanZone[],
  dimensions: any
) {
  const x = 200;
  const y = 200;
  const width = 400;
  const height = (dimensions.thickness || 50) * 4;
  
  // Draw scan zones as colored horizontal bands
  zones.forEach(zone => {
    const startY = y + (zone.depthRange.start / (dimensions.thickness || 50)) * height;
    const endY = y + (zone.depthRange.end / (dimensions.thickness || 50)) * height;
    const bandHeight = endY - startY;
    
    const gradient = ctx.createLinearGradient(x, startY, x, endY);
    gradient.addColorStop(0, zone.color + 'dd');
    gradient.addColorStop(1, zone.color + '88');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, startY, width, bandHeight);
    
    // Add hatching
    drawRectHatching(ctx, x, startY, width, bandHeight, zone.color);
  });
  
  // Draw outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

/**
 * Draw hatching pattern for ring zones
 */
function drawHatching(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  color: string
) {
  ctx.strokeStyle = color + '44';
  ctx.lineWidth = 1;
  
  const angleStep = Math.PI / 24;
  for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
    const x1 = centerX + innerRadius * Math.cos(angle);
    const y1 = centerY + innerRadius * Math.sin(angle);
    const x2 = centerX + outerRadius * Math.cos(angle);
    const y2 = centerY + outerRadius * Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

/**
 * Draw hatching pattern for rectangular zones
 */
function drawRectHatching(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  ctx.strokeStyle = color + '44';
  ctx.lineWidth = 1;
  
  const spacing = 10;
  for (let i = 0; i < width + height; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x, y + i);
    ctx.stroke();
  }
}

/**
 * Draw dimension line with label
 */
function drawDimensionLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string
) {
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  
  ctx.fillStyle = '#333333';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 5);
}
