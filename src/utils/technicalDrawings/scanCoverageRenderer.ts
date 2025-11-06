/**
 * Scan Coverage Renderer
 * Adds colored hatching patterns to technical drawings to visualize scan depth coverage
 * Based on ultrasonic inspection visualization standards
 */

import { TechnicalDrawingGenerator } from './TechnicalDrawingGenerator';

// Scan depth zone colors (matching the reference image pattern)
export interface ScanZone {
  startDepth: number;  // Starting depth in mm
  endDepth: number;    // Ending depth in mm
  color: string;       // Hex color
  label?: string;      // Optional label for the zone
}

// Default color scheme for depth zones (from surface to depth)
export const DEFAULT_DEPTH_COLORS = [
  { color: '#FFB3BA', label: 'Surface Zone' },      // Light red/pink
  { color: '#BFDBFE', label: 'Near Surface' },      // Light blue
  { color: '#86EFAC', label: 'Mid Depth' },         // Light green
  { color: '#FDE047', label: 'Deep Zone' },         // Yellow
  { color: '#FED7AA', label: 'Maximum Depth' },     // Light orange
  { color: '#DDD6FE', label: 'Extended Range' },    // Light purple
];

// Scan direction types
export type ScanDirection = 'longitudinal' | 'transverse' | 'axial' | 'radial';
export type BeamAngle = 0 | 45 | 60 | 70;

export interface ScanCoverageConfig {
  zones: ScanZone[];
  beamAngle: BeamAngle;
  scanDirection: ScanDirection;
  showLabels?: boolean;
  hatchingAngle?: number;     // Angle of hatching lines (default 45)
  hatchingSpacing?: number;   // Spacing between hatching lines (default 4)
}

/**
 * Generates scan zones based on material thickness and inspection requirements
 */
export function generateScanZones(
  totalThickness: number,
  numberOfZones: number = 5,
  colors: typeof DEFAULT_DEPTH_COLORS = DEFAULT_DEPTH_COLORS
): ScanZone[] {
  const zones: ScanZone[] = [];
  const zoneHeight = totalThickness / numberOfZones;
  
  for (let i = 0; i < numberOfZones && i < colors.length; i++) {
    zones.push({
      startDepth: i * zoneHeight,
      endDepth: (i + 1) * zoneHeight,
      color: colors[i].color,
      label: colors[i].label
    });
  }
  
  return zones;
}

/**
 * Draws colored hatching for a rectangular scan coverage area
 */
export function drawRectangularScanCoverage(
  generator: TechnicalDrawingGenerator,
  x: number,
  y: number,
  width: number,
  height: number,
  config: ScanCoverageConfig
) {
  const scope = generator.getScope();
  const {
    zones,
    hatchingAngle = 45,
    hatchingSpacing = 4
  } = config;
  
  zones.forEach((zone) => {
    // Calculate zone position based on depth
    const totalDepth = zones[zones.length - 1].endDepth;
    const startRatio = zone.startDepth / totalDepth;
    const endRatio = zone.endDepth / totalDepth;
    
    const zoneY = y + height * startRatio;
    const zoneHeight = height * (endRatio - startRatio);
    
    // Draw colored rectangle background
    const rect = new scope.Path.Rectangle(
      new scope.Point(x, zoneY),
      new scope.Size(width, zoneHeight)
    );
    rect.fillColor = new scope.Color(zone.color + '40'); // 40 = 25% opacity
    rect.strokeColor = null;
    
    // Draw hatching pattern on top
    drawColoredHatching(
      generator,
      x,
      zoneY,
      width,
      zoneHeight,
      zone.color,
      hatchingAngle,
      hatchingSpacing
    );
  });
}

/**
 * Draws colored hatching for a cylindrical scan coverage (side view)
 */
export function drawCylindricalScanCoverage(
  generator: TechnicalDrawingGenerator,
  x: number,
  y: number,
  length: number,
  diameter: number,
  config: ScanCoverageConfig
) {
  const scope = generator.getScope();
  const {
    zones,
    hatchingAngle = 45,
    hatchingSpacing = 4
  } = config;
  
  const centerY = y + diameter / 2;
  
  zones.forEach((zone) => {
    const totalDepth = zones[zones.length - 1].endDepth;
    const startRatio = zone.startDepth / totalDepth;
    const endRatio = zone.endDepth / totalDepth;
    
    // For cylindrical parts, depth radiates from surface inward
    const topZoneY = centerY - diameter / 2 + (diameter / 2) * startRatio;
    const bottomZoneY = centerY + diameter / 2 - (diameter / 2) * startRatio;
    const zoneHeight = (diameter / 2) * (endRatio - startRatio);
    
    // Top band
    const topRect = new scope.Path.Rectangle(
      new scope.Point(x, topZoneY),
      new scope.Size(length, zoneHeight)
    );
    topRect.fillColor = new scope.Color(zone.color + '40');
    topRect.strokeColor = null;
    
    drawColoredHatching(
      generator,
      x,
      topZoneY,
      length,
      zoneHeight,
      zone.color,
      hatchingAngle,
      hatchingSpacing
    );
    
    // Bottom band (mirror)
    const bottomRect = new scope.Path.Rectangle(
      new scope.Point(x, bottomZoneY - zoneHeight),
      new scope.Size(length, zoneHeight)
    );
    bottomRect.fillColor = new scope.Color(zone.color + '40');
    bottomRect.strokeColor = null;
    
    drawColoredHatching(
      generator,
      x,
      bottomZoneY - zoneHeight,
      length,
      zoneHeight,
      zone.color,
      hatchingAngle,
      hatchingSpacing
    );
  });
}

/**
 * Draws colored hatching pattern within a specified area
 */
function drawColoredHatching(
  generator: TechnicalDrawingGenerator,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  angle: number = 45,
  spacing: number = 4
) {
  const scope = generator.getScope();
  const rect = new scope.Path.Rectangle(
    new scope.Point(x, y),
    new scope.Size(width, height)
  );
  
  const angleRad = (angle * Math.PI) / 180;
  const maxDim = Math.max(width, height) * 2;
  const numLines = Math.ceil(maxDim / spacing);
  
  for (let i = -numLines; i < numLines; i++) {
    const offset = i * spacing;
    const x1 = x + width / 2 + offset * Math.cos(angleRad) - maxDim * Math.sin(angleRad);
    const y1 = y + height / 2 + offset * Math.sin(angleRad) + maxDim * Math.cos(angleRad);
    const x2 = x + width / 2 + offset * Math.cos(angleRad) + maxDim * Math.sin(angleRad);
    const y2 = y + height / 2 + offset * Math.sin(angleRad) - maxDim * Math.cos(angleRad);
    
    const line = new scope.Path.Line(
      new scope.Point(x1, y1),
      new scope.Point(x2, y2)
    );
    line.strokeColor = new scope.Color(color);
    line.strokeWidth = 0.8;
    line.opacity = 0.6;
    
    const clipped = line.intersect(rect);
    if (clipped) {
      clipped.parent = scope.project.activeLayer;
    }
    line.remove();
  }
  
  rect.remove();
}

/**
 * Draws scan direction indicator (beam direction arrow and label)
 */
export function drawScanDirectionIndicator(
  generator: TechnicalDrawingGenerator,
  x: number,
  y: number,
  direction: ScanDirection,
  beamAngle: BeamAngle,
  label: string = 'Beam Direction'
) {
  const scope = generator.getScope();
  
  // Draw arrow indicating beam direction
  const arrowLength = 40;
  const arrowAngleRad = (beamAngle * Math.PI) / 180;
  
  const endX = x + arrowLength * Math.cos(Math.PI / 2 - arrowAngleRad);
  const endY = y + arrowLength * Math.sin(Math.PI / 2 - arrowAngleRad);
  
  // Arrow line
  generator.drawLine(x, y, endX, endY, 'dimension');
  
  // Arrow head
  const arrowHeadSize = 8;
  const arrowHeadAngle = Math.atan2(endY - y, endX - x);
  generator.drawArrow(endX, endY, arrowHeadAngle, arrowHeadSize);
  
  // Label
  generator.drawText(
    endX + 15,
    endY,
    `${label} (${beamAngle}°)`,
    10,
    '#CC0000'
  );
}

/**
 * Adds scan coverage visualization to existing box drawing
 */
export function addBoxScanCoverage(
  generator: TechnicalDrawingGenerator,
  viewConfig: { x: number; y: number; width: number; height: number },
  dimensions: { length: number; width: number; thickness: number },
  config: ScanCoverageConfig
) {
  const { x, y, width, height } = viewConfig;
  const scale = Math.min(width / dimensions.length, height / dimensions.thickness) * 0.6;
  
  const scaledLength = dimensions.length * scale;
  const scaledThickness = dimensions.thickness * scale;
  
  const rectX = x + (width - scaledLength) / 2;
  const rectY = y + (height - scaledThickness) / 2;
  
  drawRectangularScanCoverage(
    generator,
    rectX,
    rectY,
    scaledLength,
    scaledThickness,
    config
  );
}

/**
 * Adds scan coverage visualization to existing cylinder drawing
 */
export function addCylinderScanCoverage(
  generator: TechnicalDrawingGenerator,
  viewConfig: { x: number; y: number; width: number; height: number },
  dimensions: { length: number; diameter: number },
  config: ScanCoverageConfig
) {
  const { x, y, width, height } = viewConfig;
  const scale = Math.min(width / dimensions.length, height / dimensions.diameter) * 0.6;
  
  const scaledLength = dimensions.length * scale;
  const scaledDiameter = dimensions.diameter * scale;
  
  const rectX = x + (width - scaledLength) / 2;
  const rectY = y + (height - scaledDiameter) / 2;
  
  drawCylindricalScanCoverage(
    generator,
    rectX,
    rectY,
    scaledLength,
    scaledDiameter,
    config
  );
}
