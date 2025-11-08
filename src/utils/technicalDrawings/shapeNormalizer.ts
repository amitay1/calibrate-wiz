/**
 * Shape Normalizer
 * Maps legacy part types to base geometries for technical drawing generation
 */

import { PartGeometry } from '@/types/techniqueSheet';

interface NormalizedShape {
  baseGeometry: PartGeometry;
  displayName: string;
  useHollow?: boolean;
}

/**
 * Normalize any part type to its base geometry for technical drawings
 */
export function normalizePartType(partType: PartGeometry | string): NormalizedShape {
  const type = partType.toLowerCase();
  
  // Box-based geometries
  if (type.match(/box|plate|sheet|slab|flat_bar|rectangular_bar|square_bar|billet|block|rectangular_forging/)) {
    return {
      baseGeometry: 'box',
      displayName: getDisplayName(partType)
    };
  }
  
  // Cylinder-based geometries (solid)
  if (type.match(/cylinder|round_bar|shaft|disk|disk_forging|hub|round_forging/)) {
    return {
      baseGeometry: 'cylinder',
      displayName: getDisplayName(partType)
    };
  }
  
  // Tube-based geometries (hollow cylinder)
  if (type.match(/tube|pipe|ring|ring_forging|sleeve|bushing/)) {
    return {
      baseGeometry: 'tube',
      displayName: getDisplayName(partType),
      useHollow: true
    };
  }
  
  // Rectangular tube
  if (type.match(/rectangular_tube|square_tube/)) {
    return {
      baseGeometry: 'rectangular_tube',
      displayName: getDisplayName(partType),
      useHollow: true
    };
  }
  
  // Hexagon
  if (type.match(/hexagon|hex_bar/)) {
    return {
      baseGeometry: 'hexagon',
      displayName: getDisplayName(partType)
    };
  }
  
  // Sphere
  if (type.match(/sphere/)) {
    return {
      baseGeometry: 'sphere',
      displayName: 'Sphere'
    };
  }
  
  // Cone
  if (type.match(/cone/)) {
    return {
      baseGeometry: 'cone',
      displayName: 'Cone'
    };
  }
  
  // L-Profile
  if (type.match(/l_profile|extrusion_l|extrusion_angle/)) {
    return {
      baseGeometry: 'l_profile',
      displayName: 'L-Profile (Angle)'
    };
  }
  
  // T-Profile
  if (type.match(/t_profile|extrusion_t/)) {
    return {
      baseGeometry: 't_profile',
      displayName: 'T-Profile'
    };
  }
  
  // I-Profile
  if (type.match(/i_profile|extrusion_i/)) {
    return {
      baseGeometry: 'i_profile',
      displayName: 'I-Profile (I-Beam)'
    };
  }
  
  // U-Profile
  if (type.match(/u_profile|extrusion_u|extrusion_channel/)) {
    return {
      baseGeometry: 'u_profile',
      displayName: 'U-Profile (Channel)'
    };
  }
  
  // Z-Profile
  if (type.match(/z_profile|z_section/)) {
    return {
      baseGeometry: 'z_profile',
      displayName: 'Z-Profile'
    };
  }
  
  // Default to box for unknown types
  return {
    baseGeometry: 'box',
    displayName: 'Custom Shape'
  };
}

/**
 * Get a human-readable display name for the part type
 */
function getDisplayName(partType: string): string {
  const nameMap: Record<string, string> = {
    // Box variants
    'box': 'Rectangular Block',
    'plate': 'Plate',
    'sheet': 'Sheet',
    'slab': 'Slab',
    'flat_bar': 'Flat Bar',
    'rectangular_bar': 'Rectangular Bar',
    'square_bar': 'Square Bar',
    'billet': 'Billet',
    'block': 'Block',
    
    // Cylinder variants
    'cylinder': 'Cylinder',
    'round_bar': 'Round Bar',
    'shaft': 'Shaft',
    'disk': 'Disk',
    'disk_forging': 'Disk Forging',
    'hub': 'Hub',
    'round_forging_stock': 'Round Forging Stock',
    
    // Tube variants
    'tube': 'Tube',
    'pipe': 'Pipe',
    'ring': 'Ring',
    'ring_forging': 'Ring Forging',
    'sleeve': 'Sleeve',
    'bushing': 'Bushing',
    
    // Rectangular tube
    'rectangular_tube': 'Rectangular Tube',
    'square_tube': 'Square Tube',
    
    // Profiles
    'hexagon': 'Hexagon',
    'hex_bar': 'Hexagonal Bar',
    'l_profile': 'L-Profile',
    't_profile': 'T-Profile',
    'i_profile': 'I-Profile',
    'u_profile': 'U-Profile',
    'z_profile': 'Z-Profile',
    
    // Special
    'sphere': 'Sphere',
    'cone': 'Cone',
    'custom': 'Custom Shape',
    'forging': 'Forging',
    'machined_component': 'Machined Component',
  };
  
  return nameMap[partType.toLowerCase()] || partType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Check if a part type should be treated as hollow
 */
export function shouldBeHollow(partType: PartGeometry | string, explicitHollow?: boolean): boolean {
  if (explicitHollow !== undefined) return explicitHollow;
  
  const normalized = normalizePartType(partType);
  return normalized.useHollow || false;
}
