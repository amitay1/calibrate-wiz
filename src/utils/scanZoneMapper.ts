/**
 * Scan Zone Mapper - Maps scans to depth zones based on standards
 * 
 * This utility calculates which depth zones each scan covers based on:
 * - Part geometry (cylinder, tube, flat plate, etc.)
 * - Wave type (longitudinal, shear, angle)
 * - Beam direction and angle
 * - Material thickness and probe penetration
 */

export interface ScanZone {
  scanId: string;
  waveType: 'longitudinal' | 'shear-axial' | 'shear-circumferential';
  beamAngle: number; // 0° or 45°
  color: string;
  depthRange: {
    start: number; // mm from surface
    end: number; // mm from surface
  };
  coverage: 'inner' | 'outer' | 'full-wall' | 'partial';
  side: 'A' | 'B' | 'both';
}

export interface ScanCoverageResult {
  zones: ScanZone[];
  uncoveredAreas: Array<{ start: number; end: number }>;
  totalCoverage: number; // percentage
}

/**
 * Color palette for scan zones - professional inspection colors
 */
export const SCAN_ZONE_COLORS = {
  // Longitudinal scans - red to blue gradient (surface to depth)
  longitudinal_1: '#FF6B6B', // Red - surface
  longitudinal_2: '#EE8888',
  longitudinal_3: '#B8B8FF',
  longitudinal_4: '#6B9BFF', // Blue - deep
  
  // Axial shear scans - orange to yellow
  axial_shear_1: '#FFB84D', // Orange
  axial_shear_2: '#FFD700', // Gold
  
  // Circumferential shear scans - purple to blue
  circ_shear_1: '#C084FC', // Purple
  circ_shear_2: '#60A5FA', // Light blue
  
  // Special scans
  extra_scan: '#FFA500', // Orange for extra scans without specimen
  combined: '#90EE90', // Light green for overlapping coverage
};

/**
 * Calculate scan zones for hollow cylinder/tube geometry
 * Based on MIL-STD-2154 and common UT practices
 */
export function calculateTubeScanZones(
  scans: Array<{
    id: string;
    waveType: string;
    beamAngle: number;
    side: 'A' | 'B';
  }>,
  geometry: {
    outerDiameter: number;
    innerDiameter: number;
    wallThickness: number;
  }
): ScanCoverageResult {
  const zones: ScanZone[] = [];
  const wallThickness = geometry.wallThickness;
  
  // Group scans by type
  const longitudinalScans = scans.filter(s => s.waveType.includes('ongitudinal'));
  const axialShearScans = scans.filter(s => s.waveType.includes('xial shear'));
  const circShearScans = scans.filter(s => s.waveType.includes('ircumferential'));
  
  // Longitudinal scans (0°) - penetrate from OD or ID
  longitudinalScans.forEach((scan, index) => {
    const colorIndex = index % 4 + 1;
    const depthPercentage = 100 / longitudinalScans.length;
    const startDepth = (index * depthPercentage / 100) * wallThickness;
    const endDepth = ((index + 1) * depthPercentage / 100) * wallThickness;
    
    zones.push({
      scanId: scan.id,
      waveType: 'longitudinal',
      beamAngle: 0,
      color: SCAN_ZONE_COLORS[`longitudinal_${colorIndex}` as keyof typeof SCAN_ZONE_COLORS],
      depthRange: {
        start: startDepth,
        end: endDepth,
      },
      coverage: 'full-wall',
      side: scan.side,
    });
  });
  
  // Axial shear scans (45°) - penetrate at angle from OD
  axialShearScans.forEach((scan, index) => {
    const colorIndex = (index % 2) + 1;
    // 45° shear typically covers outer 60-70% of wall
    const penetrationDepth = wallThickness * 0.7;
    
    zones.push({
      scanId: scan.id,
      waveType: 'shear-axial',
      beamAngle: 45,
      color: SCAN_ZONE_COLORS[`axial_shear_${colorIndex}` as keyof typeof SCAN_ZONE_COLORS],
      depthRange: {
        start: 0,
        end: penetrationDepth,
      },
      coverage: 'outer',
      side: scan.side,
    });
  });
  
  // Circumferential shear scans (45°) - scan around circumference
  circShearScans.forEach((scan, index) => {
    const colorIndex = (index % 2) + 1;
    // Circumferential scans typically cover full wall from angle
    
    zones.push({
      scanId: scan.id,
      waveType: 'shear-circumferential',
      beamAngle: 45,
      color: SCAN_ZONE_COLORS[`circ_shear_${colorIndex}` as keyof typeof SCAN_ZONE_COLORS],
      depthRange: {
        start: 0,
        end: wallThickness,
      },
      coverage: 'full-wall',
      side: scan.side,
    });
  });
  
  // Calculate uncovered areas
  const uncoveredAreas = findUncoveredZones(zones, wallThickness);
  
  // Calculate total coverage percentage
  const totalCoverage = calculateTotalCoverage(zones, wallThickness);
  
  return {
    zones,
    uncoveredAreas,
    totalCoverage,
  };
}

/**
 * Calculate scan zones for flat plate geometry
 */
export function calculatePlateScanZones(
  scans: Array<{
    id: string;
    waveType: string;
    beamAngle: number;
    side: 'A' | 'B';
  }>,
  thickness: number
): ScanCoverageResult {
  const zones: ScanZone[] = [];
  
  scans.forEach((scan, index) => {
    const depthPercentage = 100 / scans.length;
    const startDepth = (index * depthPercentage / 100) * thickness;
    const endDepth = ((index + 1) * depthPercentage / 100) * thickness;
    
    const colorIndex = (index % 4) + 1;
    
    zones.push({
      scanId: scan.id,
      waveType: scan.waveType.includes('hear') ? 'shear-axial' : 'longitudinal',
      beamAngle: scan.beamAngle,
      color: scan.waveType.includes('hear') 
        ? SCAN_ZONE_COLORS[`axial_shear_${colorIndex % 2 + 1}` as keyof typeof SCAN_ZONE_COLORS]
        : SCAN_ZONE_COLORS[`longitudinal_${colorIndex}` as keyof typeof SCAN_ZONE_COLORS],
      depthRange: {
        start: startDepth,
        end: endDepth,
      },
      coverage: 'full-wall',
      side: scan.side,
    });
  });
  
  const uncoveredAreas = findUncoveredZones(zones, thickness);
  const totalCoverage = calculateTotalCoverage(zones, thickness);
  
  return {
    zones,
    uncoveredAreas,
    totalCoverage,
  };
}

/**
 * Calculate scan zones for cylindrical geometry (solid)
 */
export function calculateCylinderScanZones(
  scans: Array<{
    id: string;
    waveType: string;
    beamAngle: number;
    side: 'A' | 'B';
  }>,
  diameter: number
): ScanCoverageResult {
  const zones: ScanZone[] = [];
  const radius = diameter / 2;
  
  // For solid cylinders, scans typically cover from surface to center
  scans.forEach((scan, index) => {
    const depthPercentage = 100 / scans.length;
    const startDepth = (index * depthPercentage / 100) * radius;
    const endDepth = ((index + 1) * depthPercentage / 100) * radius;
    
    const colorIndex = (index % 4) + 1;
    
    zones.push({
      scanId: scan.id,
      waveType: scan.waveType.includes('hear') ? 'shear-axial' : 'longitudinal',
      beamAngle: scan.beamAngle,
      color: SCAN_ZONE_COLORS[`longitudinal_${colorIndex}` as keyof typeof SCAN_ZONE_COLORS],
      depthRange: {
        start: startDepth,
        end: endDepth,
      },
      coverage: 'full-wall',
      side: scan.side,
    });
  });
  
  const uncoveredAreas = findUncoveredZones(zones, radius);
  const totalCoverage = calculateTotalCoverage(zones, radius);
  
  return {
    zones,
    uncoveredAreas,
    totalCoverage,
  };
}

/**
 * Find uncovered zones in the material
 */
function findUncoveredZones(zones: ScanZone[], totalDepth: number): Array<{ start: number; end: number }> {
  if (zones.length === 0) {
    return [{ start: 0, end: totalDepth }];
  }
  
  // Sort zones by start depth
  const sortedZones = [...zones].sort((a, b) => a.depthRange.start - b.depthRange.start);
  
  const uncovered: Array<{ start: number; end: number }> = [];
  let currentDepth = 0;
  
  sortedZones.forEach(zone => {
    if (zone.depthRange.start > currentDepth) {
      uncovered.push({
        start: currentDepth,
        end: zone.depthRange.start,
      });
    }
    currentDepth = Math.max(currentDepth, zone.depthRange.end);
  });
  
  // Check if there's uncovered area at the end
  if (currentDepth < totalDepth) {
    uncovered.push({
      start: currentDepth,
      end: totalDepth,
    });
  }
  
  return uncovered;
}

/**
 * Calculate total coverage percentage
 */
function calculateTotalCoverage(zones: ScanZone[], totalDepth: number): number {
  if (zones.length === 0 || totalDepth === 0) return 0;
  
  // Create coverage array
  const coverageArray = new Array(Math.ceil(totalDepth * 10)).fill(0);
  
  zones.forEach(zone => {
    const startIdx = Math.floor(zone.depthRange.start * 10);
    const endIdx = Math.ceil(zone.depthRange.end * 10);
    
    for (let i = startIdx; i < endIdx && i < coverageArray.length; i++) {
      coverageArray[i] = 1;
    }
  });
  
  const coveredPoints = coverageArray.reduce((sum, val) => sum + val, 0);
  return (coveredPoints / coverageArray.length) * 100;
}

/**
 * Get scan zone calculation based on part type
 */
export function getScanZonesForPartType(
  partType: string,
  scans: Array<{
    id: string;
    waveType: string;
    beamAngle: number;
    side: 'A' | 'B';
  }>,
  dimensions: any
): ScanCoverageResult {
  const normalizedPartType = partType.toLowerCase();
  
  if (normalizedPartType.includes('tube') || normalizedPartType.includes('hollow') || normalizedPartType.includes('ring')) {
    return calculateTubeScanZones(scans, {
      outerDiameter: dimensions.diameter || dimensions.outerDiameter || 100,
      innerDiameter: dimensions.innerDiameter || dimensions.diameter * 0.75 || 75,
      wallThickness: dimensions.thickness || dimensions.wallThickness || 12.5,
    });
  } else if (normalizedPartType.includes('cylinder') || normalizedPartType.includes('round')) {
    return calculateCylinderScanZones(scans, dimensions.diameter || 100);
  } else {
    // Flat plate or box
    return calculatePlateScanZones(scans, dimensions.thickness || dimensions.height || 50);
  }
}
