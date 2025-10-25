import * as THREE from 'three';

/**
 * Material presets for different metal types
 */
export const createMetalMaterial = (color: string, roughness = 0.3, metalness = 0.9) => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    envMapIntensity: 1.5,
  });
};

export const ShapeMaterials = {
  // Blues - Plates & Sheets
  plateBlue: () => createMetalMaterial('#3b82f6', 0.25, 0.95),
  sheetBlue: () => createMetalMaterial('#60a5fa', 0.2, 0.95),
  slabBlue: () => createMetalMaterial('#2563eb', 0.3, 0.9),
  
  // Greens - Flat & Rectangular Bars
  flatBarGreen: () => createMetalMaterial('#10b981', 0.3, 0.85),
  rectBarGreen: () => createMetalMaterial('#059669', 0.35, 0.85),
  
  // Oranges/Yellows - Square & Block
  squareBarOrange: () => createMetalMaterial('#f59e0b', 0.3, 0.9),
  billetYellow: () => createMetalMaterial('#fbbf24', 0.25, 0.9),
  blockOrange: () => createMetalMaterial('#f59e0b', 0.35, 0.85),
  
  // Purples - Round Bars & Shafts
  roundBarPurple: () => createMetalMaterial('#8b5cf6', 0.25, 0.95),
  shaftPurple: () => createMetalMaterial('#a78bfa', 0.3, 0.9),
  
  // Reds - Forgings
  forgingRed: () => createMetalMaterial('#ef4444', 0.4, 0.8),
  roundForgingRed: () => createMetalMaterial('#f87171', 0.35, 0.85),
  
  // Pinks - Ring & Disk Forgings
  ringForgingPink: () => createMetalMaterial('#ec4899', 0.3, 0.9),
  diskForgingTeal: () => createMetalMaterial('#14b8a6', 0.25, 0.95),
  
  // Cyans - Hex & Extrusions
  hexBarCyan: () => createMetalMaterial('#06b6d4', 0.3, 0.9),
  extrusionCyan: () => createMetalMaterial('#0891b2', 0.35, 0.85),
  
  // Grays - Tubes & Generic
  tubeGray: () => createMetalMaterial('#64748b', 0.25, 0.95),
  pipeGray: () => createMetalMaterial('#475569', 0.3, 0.9),
  sleeveGray: () => createMetalMaterial('#94a3b8', 0.25, 0.9),
  genericGray: () => createMetalMaterial('#71717a', 0.4, 0.7),
  
  // Edge highlighting material (for glowing edges)
  edgeGlow: (color: string) => new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.6,
    side: THREE.BackSide,
  }),
};

/**
 * Get material by part type
 */
export const getMaterialByType = (partType: string): THREE.MeshStandardMaterial => {
  const materialMap: { [key: string]: () => THREE.MeshStandardMaterial } = {
    plate: ShapeMaterials.plateBlue,
    sheet: ShapeMaterials.sheetBlue,
    slab: ShapeMaterials.slabBlue,
    flat_bar: ShapeMaterials.flatBarGreen,
    rectangular_bar: ShapeMaterials.rectBarGreen,
    square_bar: ShapeMaterials.squareBarOrange,
    round_bar: ShapeMaterials.roundBarPurple,
    shaft: ShapeMaterials.shaftPurple,
    hex_bar: ShapeMaterials.hexBarCyan,
    tube: ShapeMaterials.tubeGray,
    pipe: ShapeMaterials.pipeGray,
    sleeve: ShapeMaterials.sleeveGray,
    bushing: ShapeMaterials.sleeveGray,
    disk: ShapeMaterials.genericGray,
    disk_forging: ShapeMaterials.diskForgingTeal,
    ring: ShapeMaterials.genericGray,
    ring_forging: ShapeMaterials.ringForgingPink,
    forging: ShapeMaterials.forgingRed,
    round_forging_stock: ShapeMaterials.roundForgingRed,
    billet: ShapeMaterials.billetYellow,
    block: ShapeMaterials.blockOrange,
    extrusion_l: ShapeMaterials.extrusionCyan,
    extrusion_t: ShapeMaterials.extrusionCyan,
    extrusion_i: ShapeMaterials.extrusionCyan,
    extrusion_u: ShapeMaterials.extrusionCyan,
    extrusion_channel: ShapeMaterials.extrusionCyan,
    extrusion_angle: ShapeMaterials.extrusionCyan,
  };
  
  return (materialMap[partType] || ShapeMaterials.genericGray)();
};
