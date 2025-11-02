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
  // ============= BASE GEOMETRIES =============
  box: () => {
    const geometry = new THREE.BoxGeometry(2, 1, 1.5);
    return perfectCenter(geometry);
  },
  
  cylinder: () => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    geometry.rotateZ(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  tube: () => {
    const geometry = new THREE.TorusGeometry(0.8, 0.25, 16, 32);
    geometry.rotateX(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  rectangular_tube: () => {
    const geometry = new THREE.BoxGeometry(1, 2, 0.6);
    return perfectCenter(geometry);
  },
  
  hexagon: () => {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 6);
    geometry.rotateZ(Math.PI / 2);
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
  
  // ============= STRUCTURAL PROFILES =============
  l_profile: () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.4, -0.4);
    shape.lineTo(0.4, -0.4);
    shape.lineTo(0.4, -0.2);
    shape.lineTo(-0.2, -0.2);
    shape.lineTo(-0.2, 0.4);
    shape.lineTo(-0.4, 0.4);
    shape.lineTo(-0.4, -0.4);
    
    const extrudeSettings = { steps: 1, depth: 2, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  t_profile: () => {
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
    
    const extrudeSettings = { steps: 1, depth: 2, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  i_profile: () => {
    const geometry = new THREE.BoxGeometry(0.6, 2, 0.15);
    return perfectCenter(geometry);
  },
  
  u_profile: () => {
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
    
    const extrudeSettings = { steps: 1, depth: 2, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  z_profile: () => {
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
    
    const extrudeSettings = { steps: 1, depth: 2, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateY(Math.PI / 2);
    return perfectCenter(geometry);
  },
  
  // ============= LEGACY MAPPINGS (for backward compatibility) =============
  plate: () => ShapeGeometries.box(),
  sheet: () => ShapeGeometries.box(),
  slab: () => ShapeGeometries.box(),
  flat_bar: () => ShapeGeometries.box(),
  rectangular_bar: () => ShapeGeometries.box(),
  square_bar: () => ShapeGeometries.box(),
  billet: () => ShapeGeometries.box(),
  block: () => ShapeGeometries.box(),
  
  round_bar: () => ShapeGeometries.cylinder(),
  shaft: () => ShapeGeometries.cylinder(),
  disk: () => ShapeGeometries.cylinder(),
  disk_forging: () => ShapeGeometries.cylinder(),
  hub: () => ShapeGeometries.cylinder(),
  
  pipe: () => ShapeGeometries.tube(),
  ring: () => ShapeGeometries.tube(),
  ring_forging: () => ShapeGeometries.tube(),
  sleeve: () => ShapeGeometries.tube(),
  bushing: () => ShapeGeometries.tube(),
  
  square_tube: () => ShapeGeometries.rectangular_tube(),
  
  hex_bar: () => ShapeGeometries.hexagon(),
  
  extrusion_l: () => ShapeGeometries.l_profile(),
  extrusion_angle: () => ShapeGeometries.l_profile(),
  extrusion_t: () => ShapeGeometries.t_profile(),
  extrusion_i: () => ShapeGeometries.i_profile(),
  extrusion_u: () => ShapeGeometries.u_profile(),
  extrusion_channel: () => ShapeGeometries.u_profile(),
  
  // Generic fallbacks
  bar: () => ShapeGeometries.box(),
  forging: () => ShapeGeometries.cylinder(),
  round_forging_stock: () => ShapeGeometries.cylinder(),
  rectangular_forging_stock: () => ShapeGeometries.box(),
  near_net_forging: () => ShapeGeometries.cylinder(),
  machined_component: () => ShapeGeometries.box(),
  custom_profile: () => ShapeGeometries.box(),
  custom: () => ShapeGeometries.box(),
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