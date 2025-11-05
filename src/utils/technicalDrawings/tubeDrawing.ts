/**
 * Tube (Hollow Cylinder) Technical Drawing Module
 * Generates multi-view technical drawings for tubular parts
 */

import { TechnicalDrawingGenerator, Dimensions, LayoutConfig } from './TechnicalDrawingGenerator';
import { getScanZonesForPartType } from '@/utils/scanZoneMapper';

export function drawTubeTechnicalDrawing(
  generator: TechnicalDrawingGenerator,
  dimensions: Dimensions,
  layout: LayoutConfig,
  scans: Array<{ id: string; waveType: string; beamAngle: number; side: 'A' | 'B' }> = []
): void {
  const outerDiameter = dimensions.diameter || dimensions.outerDiameter || 50;
  const wallThickness = dimensions.wallThickness || dimensions.thickness || 5;
  const innerDiameter = outerDiameter - (2 * wallThickness);
  const length = dimensions.length;
  
  // Calculate scan zones if scans are provided
  const scanCoverage = scans.length > 0 
    ? getScanZonesForPartType('tube', scans, { 
        outerDiameter, 
        innerDiameter, 
        wallThickness,
        diameter: outerDiameter,
        thickness: wallThickness
      })
    : null;
  
  // FRONT VIEW (Length × OD with inner rectangle)
  drawFrontView(generator, length, outerDiameter, innerDiameter, layout.frontView);
  
  // TOP VIEW (Concentric circles) - with color zones
  drawTopView(generator, outerDiameter, innerDiameter, wallThickness, layout.topView, scanCoverage);
  
  // SECTION A-A (with hatching in wall and color zones)
  drawSectionView(generator, length, outerDiameter, innerDiameter, layout.sideView, scanCoverage);
  
  // ISOMETRIC VIEW
  drawIsometricView(generator, length, outerDiameter, innerDiameter, layout.isometric);
}

function drawFrontView(
  generator: TechnicalDrawingGenerator,
  length: number,
  outerDiameter: number,
  innerDiameter: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'FRONT VIEW');
  
  // Scale to fit
  const scale = Math.min(width / length, height / outerDiameter) * 0.6;
  const scaledLength = length * scale;
  const scaledOD = outerDiameter * scale;
  const scaledID = innerDiameter * scale;
  
  const outerX = x + (width - scaledLength) / 2;
  const outerY = y + (height - scaledOD) / 2;
  
  const innerX = outerX;
  const innerY = outerY + (scaledOD - scaledID) / 2;
  
  // Outer rectangle
  generator.drawRectangle(outerX, outerY, scaledLength, scaledOD, 'visible');
  
  // Inner rectangle (hidden lines)
  generator.drawRectangle(innerX, innerY, scaledLength, scaledID, 'hidden');
  
  // Centerlines
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  generator.drawLine(
    outerX - 20,
    centerY,
    outerX + scaledLength + 20,
    centerY,
    'center'
  );
  
  generator.drawLine(
    centerX,
    outerY - 20,
    centerX,
    outerY + scaledOD + 20,
    'center'
  );
  
  // Dimensions
  generator.drawDimension(
    outerX,
    outerY + scaledOD + 35,
    outerX + scaledLength,
    outerY + scaledOD + 35,
    `L=${length}mm`,
    5
  );
  
  generator.drawDimension(
    outerX + scaledLength + 35,
    outerY,
    outerX + scaledLength + 35,
    outerY + scaledOD,
    `OD=${outerDiameter}mm`,
    5
  );
  
  generator.drawDimension(
    outerX + scaledLength + 55,
    innerY,
    outerX + scaledLength + 55,
    innerY + scaledID,
    `ID=${innerDiameter.toFixed(1)}mm`,
    5
  );
}

function drawTopView(
  generator: TechnicalDrawingGenerator,
  outerDiameter: number,
  innerDiameter: number,
  wallThickness: number,
  viewConfig: { x: number; y: number; width: number; height: number },
  scanCoverage: any = null
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'TOP VIEW');
  
  // Scale to fit
  const scale = Math.min(width, height) / outerDiameter * 0.5;
  const scaledOuterRadius = (outerDiameter / 2) * scale;
  const scaledInnerRadius = (innerDiameter / 2) * scale;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Draw color zones if scans exist (in wall thickness)
  if (scanCoverage && scanCoverage.zones.length > 0) {
    const scope = generator.getScope();
    
    scanCoverage.zones.forEach((zone: any) => {
      const startRadius = scaledInnerRadius + (zone.depthRange.start / wallThickness) * (scaledOuterRadius - scaledInnerRadius);
      const endRadius = scaledInnerRadius + (zone.depthRange.end / wallThickness) * (scaledOuterRadius - scaledInnerRadius);
      
      // Draw colored ring
      const outerCircle = new scope.Path.Circle(new scope.Point(centerX, centerY), endRadius);
      const innerCircle = new scope.Path.Circle(new scope.Point(centerX, centerY), startRadius);
      const ring = outerCircle.subtract(innerCircle);
      outerCircle.remove();
      innerCircle.remove();
      
      ring.fillColor = new scope.Color(zone.color + '80');
      ring.strokeColor = new scope.Color(zone.color);
      ring.strokeWidth = 0.5;
    });
  }
  
  // Outer circle
  generator.drawCircle(centerX, centerY, scaledOuterRadius, 'visible');
  
  // Inner circle (hollow)
  generator.drawCircle(centerX, centerY, scaledInnerRadius, 'visible');
  
  // Centerlines
  generator.drawLine(
    centerX - scaledOuterRadius - 20,
    centerY,
    centerX + scaledOuterRadius + 20,
    centerY,
    'center'
  );
  
  generator.drawLine(
    centerX,
    centerY - scaledOuterRadius - 20,
    centerX,
    centerY + scaledOuterRadius + 20,
    'center'
  );
  
  // Dimensions
  generator.drawDimension(
    centerX - scaledOuterRadius,
    centerY - scaledOuterRadius - 30,
    centerX + scaledOuterRadius,
    centerY - scaledOuterRadius - 30,
    `OD=${outerDiameter}mm`,
    5
  );
  
  generator.drawDimension(
    centerX - scaledInnerRadius,
    centerY + scaledInnerRadius + 25,
    centerX + scaledInnerRadius,
    centerY + scaledInnerRadius + 25,
    `ID=${innerDiameter.toFixed(1)}mm`,
    5
  );
  
  // Wall thickness indicator
  const scope = generator.getScope();
  const wallLine = new scope.Path.Line(
    new scope.Point(centerX + scaledInnerRadius, centerY),
    new scope.Point(centerX + scaledOuterRadius, centerY)
  );
  wallLine.strokeColor = new scope.Color('#CC0000');
  wallLine.strokeWidth = 1.5;
  
  generator.drawText(
    centerX + (scaledInnerRadius + scaledOuterRadius) / 2,
    centerY - 10,
    `t=${wallThickness}mm`,
    10,
    '#CC0000'
  );
}

function drawSectionView(
  generator: TechnicalDrawingGenerator,
  length: number,
  outerDiameter: number,
  innerDiameter: number,
  viewConfig: { x: number; y: number; width: number; height: number },
  scanCoverage: any = null
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'SECTION A-A');
  
  // Scale to fit
  const scale = Math.min(width / length, height / outerDiameter) * 0.6;
  const scaledLength = length * scale;
  const scaledOD = outerDiameter * scale;
  const scaledID = innerDiameter * scale;
  
  const outerX = x + (width - scaledLength) / 2;
  const outerY = y + (height - scaledOD) / 2;
  
  const innerX = outerX;
  const innerY = outerY + (scaledOD - scaledID) / 2;
  
  // Draw color zones if scans exist (in wall thickness)
  const wallThicknessScaled = (scaledOD - scaledID) / 2;
  
  if (scanCoverage && scanCoverage.zones.length > 0) {
    const scope = generator.getScope();
    const actualWallThickness = (outerDiameter - innerDiameter) / 2;
    
    scanCoverage.zones.forEach((zone: any) => {
      const startDepth = (zone.depthRange.start / actualWallThickness) * wallThicknessScaled;
      const endDepth = (zone.depthRange.end / actualWallThickness) * wallThicknessScaled;
      const zoneHeight = endDepth - startDepth;
      
      // Top wall zone
      const topZone = new scope.Path.Rectangle(
        new scope.Point(outerX, outerY + startDepth),
        new scope.Size(scaledLength, zoneHeight)
      );
      topZone.fillColor = new scope.Color(zone.color + '60');
      
      // Bottom wall zone
      const bottomZone = new scope.Path.Rectangle(
        new scope.Point(outerX, outerY + scaledOD - endDepth),
        new scope.Size(scaledLength, zoneHeight)
      );
      bottomZone.fillColor = new scope.Color(zone.color + '60');
    });
  }
  
  // Outer rectangle
  generator.drawRectangle(outerX, outerY, scaledLength, scaledOD, 'visible');
  
  // Inner rectangle (cut through)
  generator.drawRectangle(innerX, innerY, scaledLength, scaledID, 'visible');
  
  // Hatching in wall (top and bottom)
  generator.drawHatching(outerX, outerY, scaledLength, wallThicknessScaled, 45, 6);
  generator.drawHatching(outerX, outerY + wallThicknessScaled + scaledID, scaledLength, wallThicknessScaled, 45, 6);
  
  // Centerlines
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  generator.drawLine(
    outerX - 20,
    centerY,
    outerX + scaledLength + 20,
    centerY,
    'center'
  );
  
  // Text label
  generator.drawText(
    centerX,
    innerY + scaledID / 2,
    'HOLLOW',
    10,
    '#666666'
  );
}

function drawIsometricView(
  generator: TechnicalDrawingGenerator,
  length: number,
  outerDiameter: number,
  innerDiameter: number,
  viewConfig: { x: number; y: number; width: number; height: number }
) {
  const { x, y, width, height } = viewConfig;
  
  // View label
  generator.drawViewLabel(x + width / 2, y, 'ISOMETRIC VIEW');
  
  // Scale to fit
  const maxDim = Math.max(length, outerDiameter);
  const scale = Math.min(width, height) / maxDim * 0.5;
  
  const scaledLength = length * scale;
  const scaledOuterRadius = (outerDiameter / 2) * scale;
  const scaledInnerRadius = (innerDiameter / 2) * scale;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  const scope = generator.getScope();
  
  // Front outer ellipse
  const frontOuterEllipse = new scope.Path.Ellipse({
    center: [centerX - scaledLength / 3, centerY + scaledOuterRadius / 3],
    radius: [scaledOuterRadius, scaledOuterRadius / 2]
  });
  frontOuterEllipse.strokeColor = new scope.Color('#000000');
  frontOuterEllipse.strokeWidth = 2;
  frontOuterEllipse.fillColor = new scope.Color('#C8C8C8');
  
  // Front inner ellipse (hollow)
  const frontInnerEllipse = new scope.Path.Ellipse({
    center: [centerX - scaledLength / 3, centerY + scaledOuterRadius / 3],
    radius: [scaledInnerRadius, scaledInnerRadius / 2]
  });
  frontInnerEllipse.strokeColor = new scope.Color('#000000');
  frontInnerEllipse.strokeWidth = 1.5;
  frontInnerEllipse.fillColor = new scope.Color('#FFFFFF');
  
  // Back outer ellipse
  const backOuterEllipse = new scope.Path.Ellipse({
    center: [centerX + scaledLength / 3, centerY - scaledOuterRadius / 3],
    radius: [scaledOuterRadius, scaledOuterRadius / 2]
  });
  backOuterEllipse.strokeColor = new scope.Color('#000000');
  backOuterEllipse.strokeWidth = 2;
  backOuterEllipse.fillColor = new scope.Color('#E8E8E8');
  
  // Outer side lines
  generator.drawLine(
    centerX - scaledLength / 3 - scaledOuterRadius,
    centerY + scaledOuterRadius / 3,
    centerX + scaledLength / 3 - scaledOuterRadius,
    centerY - scaledOuterRadius / 3,
    'visible'
  );
  
  generator.drawLine(
    centerX - scaledLength / 3 + scaledOuterRadius,
    centerY + scaledOuterRadius / 3,
    centerX + scaledLength / 3 + scaledOuterRadius,
    centerY - scaledOuterRadius / 3,
    'visible'
  );
  
  // Inner side lines (hidden)
  generator.drawLine(
    centerX - scaledLength / 3 - scaledInnerRadius,
    centerY + scaledOuterRadius / 3,
    centerX + scaledLength / 3 - scaledInnerRadius,
    centerY - scaledOuterRadius / 3,
    'hidden'
  );
  
  generator.drawLine(
    centerX - scaledLength / 3 + scaledInnerRadius,
    centerY + scaledOuterRadius / 3,
    centerX + scaledLength / 3 + scaledInnerRadius,
    centerY - scaledOuterRadius / 3,
    'hidden'
  );
}
