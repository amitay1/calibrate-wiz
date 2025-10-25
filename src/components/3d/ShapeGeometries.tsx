import * as THREE from 'three';

/**
 * Create 3D geometries for all part types
 */

export const ShapeGeometries = {
  // PLATES & SHEETS
  plate: () => {
    const geometry = new THREE.BoxGeometry(2.5, 0.3, 1.5);
    return geometry;
  },
  
  sheet: () => {
    const geometry = new THREE.BoxGeometry(2.5, 0.08, 1.5);
    return geometry;
  },
  
  slab: () => {
    const geometry = new THREE.BoxGeometry(2, 0.8, 1.4);
    return geometry;
  },
  
  // BARS
  flat_bar: () => {
    const geometry = new THREE.BoxGeometry(2.5, 0.5, 0.8);
    return geometry;
  },
  
  rectangular_bar: () => {
    const geometry = new THREE.BoxGeometry(2, 0.6, 0.8);
    return geometry;
  },
  
  square_bar: () => {
    const geometry = new THREE.BoxGeometry(0.8, 2, 0.8);
    return geometry;
  },
  
  round_bar: () => {
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 32);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  shaft: () => {
    const geometry = new THREE.CylinderGeometry(0.35, 0.35, 3, 32);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  // HEX BAR
  hex_bar: () => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 6);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  // TUBES & PIPES
  tube: () => {
    const outerRadius = 0.5;
    const innerRadius = 0.35;
    const geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, 2, 32);
    const innerGeometry = new THREE.CylinderGeometry(innerRadius, innerRadius, 2.1, 32);
    
    // Create hollow tube using CSG-like approach (simplified)
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  pipe: () => {
    const geometry = new THREE.CylinderGeometry(0.45, 0.45, 2.5, 32);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  sleeve: () => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  bushing: () => {
    const geometry = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 32);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  // DISKS
  disk: () => {
    const geometry = new THREE.CylinderGeometry(1, 1, 0.25, 32);
    return geometry;
  },
  
  disk_forging: () => {
    const geometry = new THREE.CylinderGeometry(1.1, 1.1, 0.4, 32);
    // Add center hole
    return geometry;
  },
  
  // RINGS
  ring: () => {
    const geometry = new THREE.TorusGeometry(0.8, 0.25, 16, 32);
    geometry.rotateX(Math.PI / 2);
    return geometry;
  },
  
  ring_forging: () => {
    const geometry = new THREE.TorusGeometry(0.9, 0.35, 16, 32);
    geometry.rotateX(Math.PI / 2);
    return geometry;
  },
  
  // FORGINGS
  forging: () => {
    // Generic forging - irregular shape
    const geometry = new THREE.SphereGeometry(0.7, 16, 16);
    geometry.scale(1.2, 0.8, 1);
    return geometry;
  },
  
  round_forging_stock: () => {
    const geometry = new THREE.CylinderGeometry(0.7, 0.65, 1.5, 32);
    geometry.rotateZ(Math.PI / 2);
    return geometry;
  },
  
  // BILLETS & BLOCKS
  billet: () => {
    const geometry = new THREE.BoxGeometry(1.8, 0.8, 0.8);
    return geometry;
  },
  
  block: () => {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    return geometry;
  },
  
  // EXTRUSIONS
  extrusion_l: () => {
    // L-shape using combined boxes
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.8, 0);
    shape.lineTo(0.8, 0.2);
    shape.lineTo(0.2, 0.2);
    shape.lineTo(0.2, 0.8);
    shape.lineTo(0, 0.8);
    shape.lineTo(0, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    geometry.translate(-1, -0.4, -0.4);
    return geometry;
  },
  
  extrusion_t: () => {
    // T-shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.8, 0);
    shape.lineTo(0.8, 0.2);
    shape.lineTo(0.5, 0.2);
    shape.lineTo(0.5, 0.8);
    shape.lineTo(0.3, 0.8);
    shape.lineTo(0.3, 0.2);
    shape.lineTo(0, 0.2);
    shape.lineTo(0, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    geometry.translate(-1, -0.4, -0.4);
    return geometry;
  },
  
  extrusion_i: () => {
    // I-beam - simplified
    const geometry = new THREE.BoxGeometry(0.6, 2, 0.15);
    return geometry;
  },
  
  extrusion_u: () => {
    // U-channel
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 0.8);
    shape.lineTo(0.6, 0.8);
    shape.lineTo(0.6, 0);
    shape.lineTo(0.5, 0);
    shape.lineTo(0.5, 0.7);
    shape.lineTo(0.1, 0.7);
    shape.lineTo(0.1, 0);
    shape.lineTo(0, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    geometry.translate(-1, -0.4, -0.3);
    return geometry;
  },
  
  extrusion_channel: () => {
    // Channel - similar to U
    const geometry = ShapeGeometries.extrusion_u();
    return geometry;
  },
  
  extrusion_angle: () => {
    // Angle - similar to L
    const geometry = ShapeGeometries.extrusion_l();
    return geometry;
  },
};

/**
 * Get geometry by part type
 */
export const getGeometryByType = (partType: string): THREE.BufferGeometry => {
  const geometryFunc = (ShapeGeometries as any)[partType];
  if (geometryFunc) {
    return geometryFunc();
  }
  // Fallback to generic box
  return new THREE.BoxGeometry(1, 1, 1);
};
