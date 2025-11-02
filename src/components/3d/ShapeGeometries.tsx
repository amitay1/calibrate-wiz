import * as THREE from 'three';

/**
 * Helper function to perfectly center any geometry at origin
 */
function perfectCenter(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox;
  
  if (boundingBox) {
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
  }
  
  return geometry;
}

/**
 * Create 3D geometries for all part types
 * All geometries are perfectly centered at origin (0,0,0)
 */

export const ShapeGeometries = {
  // PLATES & SHEETS - All centered at origin
  plate: () => {
    const geometry = new THREE.BoxGeometry(2.5, 0.3, 1.5);
    return perfectCenter(geometry);
  },
  
  sheet: () => {
    const geometry = new THREE.BoxGeometry(2.5, 0.08, 1.5);
    return perfectCenter(geometry);
  },
  
  slab: () => {
    const geometry = new THREE.BoxGeometry(2, 0.8, 1.4);
    return perfectCenter(geometry);
  },
  
  // BARS - All centered
  flat_bar: () => {
    const geometry = new THREE.BoxGeometry(2.5, 0.5, 0.8);
    return perfectCenter(geometry);
  },
  
  rectangular_bar: () => {
    const geometry = new THREE.BoxGeometry(2, 0.6, 0.8);
    return perfectCenter(geometry);
  },
  
  square_bar: () => {
    const geometry = new THREE.BoxGeometry(0.8, 2, 0.8);
    return perfectCenter(geometry);
  },
  
  round_bar: () => {
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 32);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  shaft: () => {
    const geometry = new THREE.CylinderGeometry(0.35, 0.35, 3, 32);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  // HEX BAR - Centered
  hex_bar: () => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 6);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  // TUBES & PIPES - All centered
  tube: () => {
    const outerRadius = 0.5;
    const geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, 2, 32);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  pipe: () => {
    const geometry = new THREE.CylinderGeometry(0.45, 0.45, 2.5, 32);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  sleeve: () => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  bushing: () => {
    const geometry = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 32);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  // DISKS - Centered
  disk: () => {
    const geometry = new THREE.CylinderGeometry(1, 1, 0.25, 32);
    return perfectCenter(geometry);
  },
  
  disk_forging: () => {
    const geometry = new THREE.CylinderGeometry(1.1, 1.1, 0.4, 32);
    return perfectCenter(geometry);
  },
  
  // RINGS - Centered
  ring: () => {
    const geometry = new THREE.TorusGeometry(0.8, 0.25, 16, 32);
    geometry.rotateX(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  ring_forging: () => {
    const geometry = new THREE.TorusGeometry(0.9, 0.35, 16, 32);
    geometry.rotateX(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  // FORGINGS - Centered
  forging: () => {
    const geometry = new THREE.SphereGeometry(0.7, 16, 16);
    geometry.scale(1.2, 0.8, 1);
    return perfectCenter(geometry);
  },
  
  round_forging_stock: () => {
    const geometry = new THREE.CylinderGeometry(0.7, 0.65, 1.5, 32);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  // BILLETS & BLOCKS - Centered
  billet: () => {
    const geometry = new THREE.BoxGeometry(1.8, 0.8, 0.8);
    return perfectCenter(geometry);
  },
  
  block: () => {
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    return perfectCenter(geometry);
  },
  
  // EXTRUSIONS - All centered properly
  extrusion_angle: () => {
    // L-shape (Angle)
    const shape = new THREE.Shape();
    shape.moveTo(-0.4, -0.4);
    shape.lineTo(0.4, -0.4);
    shape.lineTo(0.4, -0.2);
    shape.lineTo(-0.2, -0.2);
    shape.lineTo(-0.2, 0.4);
    shape.lineTo(-0.4, 0.4);
    shape.lineTo(-0.4, -0.4);
    
    const extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  extrusion_t: () => {
    // T-shape
    const shape = new THREE.Shape();
    shape.moveTo(-0.4, -0.4);
    shape.lineTo(0.4, -0.4);
    shape.lineTo(0.4, -0.2);
    shape.lineTo(0.1, -0.2);
    shape.lineTo(0.1, 0.4);
    shape.lineTo(-0.1, 0.4);
    shape.lineTo(-0.1, -0.2);
    shape.lineTo(-0.4, -0.2);
    shape.lineTo(-0.4, -0.4);
    
    const extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  extrusion_i: () => {
    // I-beam
    const geometry = new THREE.BoxGeometry(0.6, 2, 0.15);
    return perfectCenter(geometry);
  },
  
  extrusion_u: () => {
    // U-channel
    const shape = new THREE.Shape();
    shape.moveTo(-0.3, -0.4);
    shape.lineTo(-0.3, 0.4);
    shape.lineTo(0.3, 0.4);
    shape.lineTo(0.3, -0.4);
    shape.lineTo(0.2, -0.4);
    shape.lineTo(0.2, 0.3);
    shape.lineTo(-0.2, 0.3);
    shape.lineTo(-0.2, -0.4);
    shape.lineTo(-0.3, -0.4);
    
    const extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  extrusion_channel: () => {
    // Channel - centered
    const shape = new THREE.Shape();
    shape.moveTo(-0.3, -0.4);
    shape.lineTo(-0.3, 0.4);
    shape.lineTo(0.3, 0.4);
    shape.lineTo(0.3, -0.4);
    shape.lineTo(0.2, -0.4);
    shape.lineTo(0.2, 0.3);
    shape.lineTo(-0.2, 0.3);
    shape.lineTo(-0.2, -0.4);
    shape.lineTo(-0.3, -0.4);
    
    const extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  
  // NEW GEOMETRIES - All centered
  rectangular_tube: () => {
    const geometry = new THREE.BoxGeometry(1, 2, 0.6);
    return perfectCenter(geometry);
  },
  
  square_tube: () => {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    return perfectCenter(geometry);
  },
  
  rectangular_forging_stock: () => {
    const geometry = new THREE.BoxGeometry(1.5, 0.8, 0.8);
    return perfectCenter(geometry);
  },
  
  hub: () => {
    // Hub with flange
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 32);
    return perfectCenter(geometry);
  },
  
  near_net_forging: () => {
    const geometry = new THREE.SphereGeometry(0.8, 16, 16);
    geometry.scale(1.3, 0.9, 1);
    return perfectCenter(geometry);
  },
  
  z_section: () => {
    // Z-shaped profile centered
    const shape = new THREE.Shape();
    shape.moveTo(-0.3, -0.5);
    shape.lineTo(0.3, -0.5);
    shape.lineTo(0.3, -0.3);
    shape.lineTo(0, 0);
    shape.lineTo(0.3, 0.3);
    shape.lineTo(0.3, 0.5);
    shape.lineTo(-0.3, 0.5);
    shape.lineTo(-0.3, 0.3);
    shape.lineTo(0, 0);
    shape.lineTo(-0.3, -0.3);
    shape.lineTo(-0.3, -0.5);
    
    const extrudeSettings = {
      steps: 1,
      depth: 2,
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  custom_profile: () => {
    const geometry = new THREE.BoxGeometry(0.8, 2, 0.6);
    return perfectCenter(geometry);
  },
  
  machined_component: () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    return perfectCenter(geometry);
  },
  
  cylinder: () => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
    return perfectCenter(geometry);
  },
  
  sphere: () => {
    const geometry = new THREE.SphereGeometry(0.7, 32, 32);
    return perfectCenter(geometry);
  },
  
  cone: () => {
    const geometry = new THREE.ConeGeometry(0.7, 1.5, 32);
    return perfectCenter(geometry);
  },
  
  custom: () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    return perfectCenter(geometry);
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
  const fallback = new THREE.BoxGeometry(1, 1, 1);
  return perfectCenter(fallback);
};