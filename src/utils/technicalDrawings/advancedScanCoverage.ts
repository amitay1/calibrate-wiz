/**
 * Advanced Scan Coverage Visualization
 * Provides accurate depth-based coloring for technical drawings
 */

import { TechnicalDrawingGenerator } from './TechnicalDrawingGenerator';

export interface DepthZone {
  startDepth: number;  // mm from surface
  endDepth: number;    // mm from surface
  color: string;
  label: string;
  waveType: 'longitudinal' | 'shear';
  beamAngle: number;
  penetrationCapability: 'surface' | 'near' | 'mid' | 'deep' | 'full';
}

export interface ScanCoverageConfig {
  totalThickness: number;
  zones: DepthZone[];
  showLabels?: boolean;
  hatchingDensity?: number;
}

/**
 * Professional color palette for depth zones
 * Colors represent probe capabilities at different depths
 */
export const DEPTH_ZONE_COLORS = {
  // Surface zone (0-20% depth) - Red tones
  surface: '#FF4444',
  // Near surface (20-40% depth) - Orange tones
  near: '#FF8844',
  // Mid-depth (40-60% depth) - Yellow tones
  mid: '#FFCC44',
  // Deep (60-80% depth) - Green tones
  deep: '#44CC88',
  // Full depth (80-100%) - Blue tones
  full: '#4488FF',
  // Overlapping coverage
  overlap: '#CC44FF',
};

/**
 * Calculate depth zones based on wave type, beam angle, and probe characteristics
 */
export function calculateDepthZones(
  waveType: 'longitudinal' | 'shear',
  beamAngle: number,
  probeFrequency: number,
  totalThickness: number
): DepthZone[] {
  const zones: DepthZone[] = [];
  
  // Longitudinal waves (0°) - penetrate deeply, good for full thickness
  if (waveType === 'longitudinal' && beamAngle === 0) {
    const penetrationDepth = totalThickness; // Full penetration
    
    // Divide into zones based on penetration effectiveness
    zones.push({
      startDepth: 0,
      endDepth: totalThickness * 0.2,
      color: DEPTH_ZONE_COLORS.surface,
      label: 'Near Surface',
      waveType,
      beamAngle,
      penetrationCapability: 'surface',
    });
    
    zones.push({
      startDepth: totalThickness * 0.2,
      endDepth: totalThickness * 0.5,
      color: DEPTH_ZONE_COLORS.near,
      label: 'Upper Mid',
      waveType,
      beamAngle,
      penetrationCapability: 'near',
    });
    
    zones.push({
      startDepth: totalThickness * 0.5,
      endDepth: totalThickness * 0.8,
      color: DEPTH_ZONE_COLORS.mid,
      label: 'Lower Mid',
      waveType,
      beamAngle,
      penetrationCapability: 'mid',
    });
    
    zones.push({
      startDepth: totalThickness * 0.8,
      endDepth: totalThickness,
      color: DEPTH_ZONE_COLORS.deep,
      label: 'Deep',
      waveType,
      beamAngle,
      penetrationCapability: 'deep',
    });
  }
  
  // Shear waves at angle - limited penetration, good for surface/subsurface
  else if (waveType === 'shear' && beamAngle > 0) {
    // Angle affects penetration depth
    const penetrationFactor = beamAngle === 45 ? 0.7 : beamAngle === 60 ? 0.5 : 0.4;
    const maxPenetration = totalThickness * penetrationFactor;
    
    zones.push({
      startDepth: 0,
      endDepth: maxPenetration * 0.4,
      color: DEPTH_ZONE_COLORS.surface,
      label: `Surface (${beamAngle}°)`,
      waveType,
      beamAngle,
      penetrationCapability: 'surface',
    });
    
    zones.push({
      startDepth: maxPenetration * 0.4,
      endDepth: maxPenetration,
      color: DEPTH_ZONE_COLORS.near,
      label: `Subsurface (${beamAngle}°)`,
      waveType,
      beamAngle,
      penetrationCapability: 'near',
    });
  }
  
  return zones;
}

/**
 * Draw depth zones on rectangular geometry
 */
export function drawRectangularDepthZones(
  generator: TechnicalDrawingGenerator,
  x: number,
  y: number,
  width: number,
  height: number,
  config: ScanCoverageConfig
): void {
  const { zones, showLabels = true, hatchingDensity = 8 } = config;
  
  zones.forEach((zone, index) => {
    // Calculate zone position relative to height
    const zoneStartY = y + (zone.startDepth / config.totalThickness) * height;
    const zoneHeight = ((zone.endDepth - zone.startDepth) / config.totalThickness) * height;
    
    // Draw colored hatching for this zone
    drawColoredHatching(
      generator,
      x,
      zoneStartY,
      width,
      zoneHeight,
      zone.color,
      45, // angle
      hatchingDensity
    );
    
    // Draw zone boundary
    generator.drawLine(x, zoneStartY, x + width, zoneStartY, 'visible');
    
    // Draw label if enabled
    if (showLabels && zoneHeight > 20) {
      const labelY = zoneStartY + zoneHeight / 2;
      generator.drawText(
        x + width + 10,
        labelY,
        `${zone.label} (${zone.startDepth.toFixed(1)}-${zone.endDepth.toFixed(1)}mm)`,
        10,
        zone.color
      );
    }
  });
  
  // Draw outer boundary
  generator.drawRectangle(x, y, width, height, 'visible');
}

/**
 * Draw depth zones on cylindrical geometry (side view)
 */
export function drawCylindricalDepthZones(
  generator: TechnicalDrawingGenerator,
  x: number,
  y: number,
  length: number,
  diameter: number,
  config: ScanCoverageConfig
): void {
  const { zones, showLabels = true, hatchingDensity = 8 } = config;
  const radius = diameter / 2;
  
  zones.forEach((zone) => {
    // For cylindrical parts, depth is from outer surface inward
    const zoneStartRadius = radius - (zone.startDepth / config.totalThickness) * radius;
    const zoneEndRadius = radius - (zone.endDepth / config.totalThickness) * radius;
    
    // Draw top arc
    if (zoneStartRadius > 0) {
      const centerY = y + radius;
      const zoneThickness = zoneStartRadius - zoneEndRadius;
      
      // Draw hatching in cylindrical section
      for (let i = 0; i < length; i += hatchingDensity) {
        const arcY = centerY - zoneStartRadius + zoneThickness / 2;
        generator.drawLine(
          x + i,
          arcY - zoneThickness / 2,
          x + i,
          arcY + zoneThickness / 2,
          'visible'
        );
      }
    }
  });
  
  // Draw cylinder outline
  generator.drawRectangle(x, y, length, diameter, 'visible');
  generator.drawLine(x, y, x, y + diameter, 'visible');
  generator.drawLine(x + length, y, x + length, y + diameter, 'visible');
}

/**
 * Draw colored hatching pattern using canvas-based hatching
 */
function drawColoredHatching(
  generator: TechnicalDrawingGenerator,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  angle: number = 45,
  spacing: number = 8
): void {
  // Use the generator's built-in hatching method with color
  // This is a simplified version that uses the existing API
  const numLines = Math.ceil(Math.sqrt(width * width + height * height) / spacing);
  
  for (let i = 0; i < numLines; i++) {
    const offset = i * spacing;
    let x1, y1, x2, y2;
    
    if (angle === 45) {
      x1 = x + offset;
      y1 = y;
      x2 = x + offset - height;
      y2 = y + height;
    } else {
      // Horizontal lines for other angles
      x1 = x;
      y1 = y + offset;
      x2 = x + width;
      y2 = y + offset;
    }
    
    // Draw line using generator (note: will use default style, color customization limited)
    generator.drawLine(x1, y1, x2, y2, 'visible');
  }
}

/**
 * Create scan coverage visualization for multiple scans
 */
export function createMultiScanCoverage(
  scans: Array<{
    waveType: 'longitudinal' | 'shear';
    beamAngle: number;
    frequency: number;
  }>,
  totalThickness: number
): ScanCoverageConfig {
  const allZones: DepthZone[] = [];
  
  scans.forEach((scan) => {
    const scanZones = calculateDepthZones(
      scan.waveType,
      scan.beamAngle,
      scan.frequency,
      totalThickness
    );
    allZones.push(...scanZones);
  });
  
  // Sort zones by depth
  allZones.sort((a, b) => a.startDepth - b.startDepth);
  
  return {
    totalThickness,
    zones: allZones,
    showLabels: true,
    hatchingDensity: 8,
  };
}
