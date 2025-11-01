import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { PartGeometry, MaterialType } from "@/types/techniqueSheet";
import { Button } from "@/components/ui/button";
import { RotateCcw, Navigation } from "lucide-react";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { ScanDirectionArrows3D } from "./ScanDirectionArrows3D";
import { getMaterialByMaterialType } from "./3d/ShapeMaterials";

export interface ScanDirectionArrow {
  direction: string;
  waveMode: string;
  isVisible: boolean;
}

interface ThreeDViewerProps {
  partType: PartGeometry | "";
  material?: MaterialType | "";
  dimensions?: {
    length: number;
    width: number;
    thickness: number;
    diameter?: number;
  };
  scanDirections?: ScanDirectionArrow[];
}


// Component for hollow tube with real hole
const HollowTube = ({ material, outerRadius, innerRadius, length }: { material: THREE.MeshStandardMaterial; outerRadius: number; innerRadius: number; length: number }) => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    
    const extrudeSettings = {
      depth: length,
      bevelEnabled: false,
      steps: 1
    };
    
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateY(Math.PI / 2);
    geom.translate(0, 0, -length / 2);
    return geom;
  }, [outerRadius, innerRadius, length]);
  
  // Clone material and set double-sided
  const tubeMaterial = useMemo(() => {
    const mat = material.clone();
    mat.side = THREE.DoubleSide;
    return mat;
  }, [material]);
  
  return (
    <mesh castShadow receiveShadow geometry={geometry} material={tubeMaterial} />
  );
};

// Component for hollow ring with real hole
const HollowRing = ({ material, outerRadius, innerRadius, height }: { material: THREE.MeshStandardMaterial; outerRadius: number; innerRadius: number; height: number }) => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    
    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
      steps: 1
    };
    
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(Math.PI / 2);
    geom.translate(0, 0, -height / 2);
    return geom;
  }, [outerRadius, innerRadius, height]);
  
  // Clone material and set double-sided
  const ringMaterial = useMemo(() => {
    const mat = material.clone();
    mat.side = THREE.DoubleSide;
    return mat;
  }, [material]);
  
  return (
    <mesh castShadow receiveShadow geometry={geometry} material={ringMaterial} />
  );
};

const Part = ({ partType, material, dimensions = { length: 100, width: 50, thickness: 10, diameter: 50 } }: ThreeDViewerProps) => {
  // Get metallic material based on material type (aerospace metals)
  const metalMaterial = useMemo(() => getMaterialByMaterialType(material), [material]);
  const { length, width, thickness, diameter } = dimensions;

  // Scale down for better viewing (convert mm to scene units) - with dimension safety
  const scale = 0.01;
  const l = Math.max(length * scale, 0.1);
  const w = Math.max(width * scale, 0.1);
  const t = Math.max(thickness * scale, 0.1);
  const d = Math.max((diameter || 50) * scale, 0.1);

  if (!partType) {
    return (
      <mesh>
        <boxGeometry args={[1, 0.5, 0.5]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.3} />
      </mesh>
    );
  }

  // Normalize part type to handle detailed names and underscores
  const normalizedPartType = partType.toLowerCase().replace(/\s*⭐\s*/g, '').replace(/_/g, ' ').trim();

  // Determine geometry type from normalized name
  // IMPORTANT: Check EXACT and SPECIFIC types BEFORE general types
  const getGeometryType = (): string => {
    // ===== FORGING STOCK =====
    if (normalizedPartType === 'round forging stock') return 'round_forging_stock';
    if (normalizedPartType === 'rectangular forging stock') return 'rectangular_forging_stock';
    
    // ===== FORGINGS =====
    if (normalizedPartType === 'ring forging') return 'ring_forging';
    if (normalizedPartType === 'disk forging') return 'disk_forging';
    if (normalizedPartType === 'hub') return 'hub';
    if (normalizedPartType === 'shaft') return 'shaft';
    if (normalizedPartType === 'near net forging') return 'near_net_forging';
    
    // ===== ROLLED BILLET OR PLATE =====
    if (normalizedPartType === 'billet') return 'billet';
    if (normalizedPartType === 'plate') return 'plate';
    if (normalizedPartType === 'sheet') return 'sheet';
    if (normalizedPartType === 'slab') return 'slab';
    
    // ===== EXTRUDED OR ROLLED BARS =====
    if (normalizedPartType === 'round bar') return 'round_bar';
    if (normalizedPartType === 'square bar') return 'square_bar';
    if (normalizedPartType === 'rectangular bar') return 'rectangular_bar';
    if (normalizedPartType === 'hex bar') return 'hex_bar';
    if (normalizedPartType === 'flat bar') return 'flat_bar';
    
    // ===== EXTRUDED OR ROLLED SHAPES =====
    if (normalizedPartType === 'extrusion angle') return 'extrusion_angle';
    if (normalizedPartType === 'extrusion t') return 'extrusion_t';
    if (normalizedPartType === 'extrusion i') return 'extrusion_i';
    if (normalizedPartType === 'extrusion u') return 'extrusion_u';
    if (normalizedPartType === 'extrusion channel') return 'extrusion_channel';
    if (normalizedPartType === 'z section') return 'z_section';
    if (normalizedPartType === 'tube') return 'tube';
    if (normalizedPartType === 'pipe') return 'pipe';
    if (normalizedPartType === 'rectangular tube') return 'rectangular_tube';
    if (normalizedPartType === 'square tube') return 'square_tube';
    if (normalizedPartType === 'custom profile') return 'custom_profile';
    
    // ===== MACHINED PARTS =====
    if (normalizedPartType === 'machined component') return 'machined_component';
    if (normalizedPartType === 'machined ring') return 'ring';
    if (normalizedPartType === 'machined disk') return 'disk';
    if (normalizedPartType === 'machined cylinder') return 'cylinder';
    if (normalizedPartType === 'machined sphere') return 'sphere';
    if (normalizedPartType === 'machined cone') return 'cone';
    if (normalizedPartType === 'sleeve') return 'sleeve';
    if (normalizedPartType === 'bushing') return 'bushing';
    if (normalizedPartType === 'block') return 'block';
    if (normalizedPartType === 'custom machined') return 'custom';
    if (normalizedPartType === 'ring') return 'ring';
    if (normalizedPartType === 'disk') return 'disk';
    if (normalizedPartType === 'cylinder') return 'cylinder';
    if (normalizedPartType === 'sphere') return 'sphere';
    if (normalizedPartType === 'cone') return 'cone';
    if (normalizedPartType === 'custom') return 'custom';
    
    // ===== FALLBACK CHECKS (for partial matches) =====
    if (normalizedPartType.includes('disk forging')) return 'disk_forging';
    if (normalizedPartType.includes('ring forging')) return 'ring_forging';
    if (normalizedPartType.includes('near net forging')) return 'near_net_forging';
    if (normalizedPartType.includes('plate') || normalizedPartType.includes('sheet')) return 'plate';
    if (normalizedPartType.includes('tube') || normalizedPartType.includes('pipe')) return 'tube';
    if (normalizedPartType.includes('disk')) return 'disk';
    if (normalizedPartType.includes('ring')) return 'ring';
    if (normalizedPartType.includes('forging')) return 'near_net_forging';
    if (normalizedPartType.includes('billet') || normalizedPartType.includes('block')) return 'billet';
    if (normalizedPartType.includes('sleeve') || normalizedPartType.includes('bushing')) return 'sleeve';
    if (normalizedPartType.includes('round bar') || normalizedPartType.includes('cylinder')) return 'round_bar';
    if (normalizedPartType.includes('hex')) return 'hex_bar';
    if (normalizedPartType.includes('square')) return 'square_bar';
    if (normalizedPartType.includes('bar')) return 'rectangular_bar';
    if (normalizedPartType.includes('extrusion')) return 'custom_profile';
    
    return 'plate'; // default
  };

  const geometryType = getGeometryType();

  switch (geometryType) {
    // ===== ROLLED BILLET OR PLATE =====
    case "plate":
      // Plate - medium thickness, wide and long
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[l, t * 0.6, w]} />
        </mesh>
      );
    
    case "sheet":
      // Sheet - very thin, maximum width and length
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[l * 1.2, t * 0.2, w * 1.2]} />
        </mesh>
      );
    
    case "slab":
      // Slab - thicker than plate, heavy rectangular block
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[l * 0.9, t * 1.5, w * 0.9]} />
        </mesh>
      );
    
    case "billet":
      // Billet - large, thick, nearly cubic block
      const billetSize = Math.max(w, t, l * 0.5);
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[billetSize, billetSize * 0.9, billetSize * 0.85]} />
        </mesh>
      );
    
    // ===== FORGING STOCK =====
    case "round_forging_stock":
      // Round forging stock - long cylinder, thicker than bar
      const rfsRadius = Math.max(d / 2, 0.4);
      const rfsLength = Math.max(l * 1.2, 1);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
          <cylinderGeometry args={[rfsRadius, rfsRadius, rfsLength, 32]} />
        </mesh>
      );
    
    case "rectangular_forging_stock":
      // Rectangular forging stock - thick rectangular bar
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[l * 1.1, w * 0.7, t * 0.7]} />
        </mesh>
      );
    
    // ===== FORGINGS =====
    case "forging":
      // Near-net forging - organic, smooth irregular shape
      const forgingRadius = Math.max(d / 2, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 6]} material={metalMaterial}>
          <icosahedronGeometry args={[forgingRadius, 3]} />
        </mesh>
      );
    
    case "hub":
      // Hub - disk with central boss/protrusion
      const hubRadius = Math.max(d / 2, 0.5);
      const hubHeight = Math.max(t * 0.8, 0.2);
      const bossRadius = hubRadius * 0.4;
      const bossHeight = hubHeight * 1.5;
      return (
        <group>
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
            <cylinderGeometry args={[hubRadius, hubRadius, hubHeight, 32]} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, bossHeight * 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
            <cylinderGeometry args={[bossRadius, bossRadius * 0.9, bossHeight, 32]} />
          </mesh>
        </group>
      );
    
    case "shaft":
      // Shaft - long, slender cylinder with steps
      const shaftRadius = Math.max(d / 2, 0.25);
      const shaftLength = Math.max(l * 1.5, 1.5);
      return (
        <group>
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
            <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 32]} />
          </mesh>
          <mesh castShadow receiveShadow position={[shaftLength * 0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
            <cylinderGeometry args={[shaftRadius * 1.3, shaftRadius * 1.3, shaftLength * 0.2, 32]} />
          </mesh>
        </group>
      );
    
    // ===== BARS =====
    case "round_bar":
      // Round bar - standard cylinder, medium length
      const rbRadius = Math.max(d / 2, 0.2);
      const rbLength = Math.max(l, 0.8);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
          <cylinderGeometry args={[rbRadius, rbRadius, rbLength, 32]} />
        </mesh>
      );
    
    case "square_bar":
      // Square bar - square cross-section
      const sbSize = Math.max(w * 0.5, 0.2);
      const sbLength = Math.max(l, 0.8);
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[sbLength, sbSize, sbSize]} />
        </mesh>
      );
    
    case "rectangular_bar":
      // Rectangular bar - wider than tall
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[l, t * 0.4, w * 0.6]} />
        </mesh>
      );
    
    case "flat_bar":
      // Flat bar - very wide, very thin
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[l, t * 0.3, w * 0.9]} />
        </mesh>
      );
    
    // ===== TUBES =====
    case "tube":
      // Standard tube - round hollow
      const tubeOuterRadius = d / 2;
      const tubeInnerRadius = Math.max((d / 2) - t, 0.05);
      const tubeLength = l;
      return (
        <HollowTube 
          material={metalMaterial} 
          outerRadius={tubeOuterRadius} 
          innerRadius={tubeInnerRadius} 
          length={tubeLength} 
        />
      );
    
    case "pipe":
      // Pipe - thicker walls than tube
      const pipeOuterRadius = d / 2;
      const pipeInnerRadius = Math.max((d / 2) - t * 1.5, 0.05);
      const pipeLength = l;
      return (
        <HollowTube 
          material={metalMaterial} 
          outerRadius={pipeOuterRadius} 
          innerRadius={pipeInnerRadius} 
          length={pipeLength} 
        />
      );
    
    case "rectangular_tube":
      // Rectangular tube - hollow rectangular
      const rtWall = 0.05;
      const rtOuterL = l;
      const rtOuterW = w * 0.6;
      const rtOuterT = t * 0.6;
      return (
        <group>
          <mesh castShadow receiveShadow material={metalMaterial}>
            <boxGeometry args={[rtOuterL, rtOuterW, rtOuterT]} />
          </mesh>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[rtOuterL + 0.01, rtOuterW - rtWall * 2, rtOuterT - rtWall * 2]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
          </mesh>
        </group>
      );
    
    case "square_tube":
      // Square tube - hollow square
      const stSize = Math.max(w * 0.5, 0.3);
      const stLength = l;
      const stWall = 0.05;
      return (
        <group>
          <mesh castShadow receiveShadow material={metalMaterial}>
            <boxGeometry args={[stLength, stSize, stSize]} />
          </mesh>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[stLength + 0.01, stSize - stWall * 2, stSize - stWall * 2]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
          </mesh>
        </group>
      );
    
    // ===== RINGS & DISKS =====
    case "ring":
      // Ring - hollow cylinder, short
      const ringOuterRadius = Math.max(d / 2, 0.5);
      const ringInnerRadius = Math.max((d / 2) - t, 0.2);
      const ringHeight = Math.max(w * 0.5, 0.3);
      return (
        <HollowRing 
          material={metalMaterial} 
          outerRadius={ringOuterRadius} 
          innerRadius={ringInnerRadius} 
          height={ringHeight} 
        />
      );
    
    case "disk":
      // Disk - solid, flat circular
      const diskRadius = Math.max(d / 2, 0.5);
      const diskHeight = Math.max(t, 0.1);
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[diskRadius, diskRadius, diskHeight, 32]} />
        </mesh>
      );
    
    // ===== OTHER SHAPES =====
    case "cylinder":
      // Cylinder - medium height cylinder
      const cylRadius = Math.max(d / 2, 0.3);
      const cylHeight = Math.max(w, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[cylRadius, cylRadius, cylHeight, 32]} />
        </mesh>
      );
    
    case "sphere":
      // Sphere - perfect sphere
      const sphereRadius = Math.max(d / 2, 0.4);
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <sphereGeometry args={[sphereRadius, 32, 32]} />
        </mesh>
      );
    
    case "cone":
      // Cone - tapered cylinder
      const coneRadius = Math.max(d / 2, 0.3);
      const coneHeight = Math.max(w, 0.6);
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <coneGeometry args={[coneRadius, coneHeight, 32]} />
        </mesh>
      );
    
    case "hex_bar":
      // Hex bar - hexagonal prism
      const hexRadius = Math.max(w * 0.5, 0.2);
      const hexHeight = Math.max(l, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
          <cylinderGeometry args={[hexRadius, hexRadius, hexHeight, 6]} />
        </mesh>
      );
    
    case "disk_forging":
      // Disk forging - thicker and more robust than regular disk
      const dfRadius = Math.max(d / 2, 0.5);
      const dfHeight = Math.max(t * 1.2, 0.15);
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[dfRadius, dfRadius * 0.95, dfHeight, 32]} />
        </mesh>
      );
    
    case "ring_forging":
      // Ring forging - thicker and more substantial than regular ring
      const rfOuterRadius = Math.max(d / 2, 0.5);
      const rfInnerRadius = Math.max((d / 2) - t * 1.2, 0.25);
      const rfHeight = Math.max(w * 0.6, 0.35);
      return (
        <HollowRing 
          material={metalMaterial} 
          outerRadius={rfOuterRadius} 
          innerRadius={rfInnerRadius} 
          height={rfHeight} 
        />
      );
    
    case "near_net_forging":
      // Near-net forging - organic irregular shape
      const nnfRadius = Math.max(d / 2, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 6]} material={metalMaterial}>
          <icosahedronGeometry args={[nnfRadius * 1.1, 3]} />
        </mesh>
      );
    
    case "sleeve":
      // Sleeve - longer, thinner walls
      const sleeveOuterRadius = d / 2;
      const sleeveInnerRadius = Math.max((d / 2) - t * 0.6, 0.05);
      const sleeveLength = Math.max(l * 0.7, w * 0.8);
      return (
        <HollowTube 
          material={metalMaterial} 
          outerRadius={sleeveOuterRadius} 
          innerRadius={sleeveInnerRadius} 
          length={sleeveLength} 
        />
      );
    
    case "bushing":
      // Bushing - shorter, thicker walls, more compact
      const bushingOuterRadius = d / 2 * 0.85;
      const bushingInnerRadius = Math.max((d / 2) - t * 1.5, 0.05);
      const bushingLength = Math.min(l * 0.4, w * 0.5);
      return (
        <HollowTube 
          material={metalMaterial} 
          outerRadius={bushingOuterRadius} 
          innerRadius={bushingInnerRadius} 
          length={bushingLength} 
        />
      );
    
    case "block":
      // Block - compact rectangular
      const blockSize = Math.min(l, w, t);
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[blockSize, blockSize * 0.8, blockSize * 0.9]} />
        </mesh>
      );
    
    case "machined_component":
      // Machined component - complex stepped shape
      return (
        <group>
          <mesh castShadow receiveShadow material={metalMaterial}>
            <boxGeometry args={[l * 0.7, w * 0.6, t * 0.6]} />
          </mesh>
          <mesh castShadow receiveShadow position={[l * 0.2, 0, 0]} material={metalMaterial}>
            <boxGeometry args={[l * 0.3, w * 0.8, t * 0.8]} />
          </mesh>
        </group>
      );
    
    // ===== EXTRUSIONS =====
    case "extrusion_angle":
      // L-profile (angle) - two perpendicular flanges
      const angleThickness = Math.min(w, t) * 0.15;
      const angleLength = l * 1.2;
      const angleWidth = Math.max(w * 0.6, t * 0.6);
      return (
        <group>
          {/* Horizontal flange */}
          <mesh castShadow receiveShadow position={[0, -angleWidth/2 + angleThickness/2, 0]} material={metalMaterial}>
            <boxGeometry args={[angleLength, angleThickness, angleWidth]} />
          </mesh>
          {/* Vertical flange */}
          <mesh castShadow receiveShadow position={[0, 0, -angleWidth/2 + angleThickness/2]} material={metalMaterial}>
            <boxGeometry args={[angleLength, angleWidth, angleThickness]} />
          </mesh>
        </group>
      );
    
    case "extrusion_t":
      // T-profile - vertical web with horizontal flange on top
      const tWebThickness = Math.min(w, t) * 0.12;
      const tLength = l * 1.2;
      const tHeight = Math.max(w * 0.8, t * 0.8);
      const tFlangeWidth = Math.max(w * 0.7, t * 0.7);
      return (
        <group>
          {/* Vertical web */}
          <mesh castShadow receiveShadow position={[0, 0, 0]} material={metalMaterial}>
            <boxGeometry args={[tLength, tHeight, tWebThickness]} />
          </mesh>
          {/* Top flange */}
          <mesh castShadow receiveShadow position={[0, tHeight/2, 0]} material={metalMaterial}>
            <boxGeometry args={[tLength, tWebThickness, tFlangeWidth]} />
          </mesh>
        </group>
      );
    
    case "extrusion_i":
      // I-beam - two flanges with web connecting them
      const iWebThickness = Math.min(w, t) * 0.1;
      const iLength = l * 1.2;
      const iHeight = Math.max(w * 0.9, t * 0.9);
      const iFlangeWidth = Math.max(w * 0.6, t * 0.6);
      const iFlangeThickness = iWebThickness * 1.5;
      return (
        <group>
          {/* Vertical web */}
          <mesh castShadow receiveShadow material={metalMaterial}>
            <boxGeometry args={[iLength, iHeight, iWebThickness]} />
          </mesh>
          {/* Top flange */}
          <mesh castShadow receiveShadow position={[0, iHeight/2, 0]} material={metalMaterial}>
            <boxGeometry args={[iLength, iFlangeThickness, iFlangeWidth]} />
          </mesh>
          {/* Bottom flange */}
          <mesh castShadow receiveShadow position={[0, -iHeight/2, 0]} material={metalMaterial}>
            <boxGeometry args={[iLength, iFlangeThickness, iFlangeWidth]} />
          </mesh>
        </group>
      );
    
    case "extrusion_u":
    case "extrusion_channel":
      // U-channel - two parallel flanges with web connecting them
      const uWebThickness = Math.min(w, t) * 0.12;
      const uLength = l * 1.2;
      const uHeight = Math.max(w * 0.8, t * 0.8);
      const uFlangeDepth = Math.max(w * 0.4, t * 0.4);
      return (
        <group>
          {/* Back web */}
          <mesh castShadow receiveShadow position={[0, 0, -uFlangeDepth/2]} material={metalMaterial}>
            <boxGeometry args={[uLength, uHeight, uWebThickness]} />
          </mesh>
          {/* Left flange */}
          <mesh castShadow receiveShadow position={[0, uHeight/2, 0]} material={metalMaterial}>
            <boxGeometry args={[uLength, uWebThickness, uFlangeDepth]} />
          </mesh>
          {/* Right flange */}
          <mesh castShadow receiveShadow position={[0, -uHeight/2, 0]} material={metalMaterial}>
            <boxGeometry args={[uLength, uWebThickness, uFlangeDepth]} />
          </mesh>
        </group>
      );
    
    case "z_section":
      // Z-profile - offset flanges like a Z shape
      const zThickness = Math.min(w, t) * 0.12;
      const zLength = l * 1.2;
      const zHeight = Math.max(w * 0.8, t * 0.8);
      const zFlangeWidth = Math.max(w * 0.5, t * 0.5);
      return (
        <group>
          {/* Vertical web */}
          <mesh castShadow receiveShadow material={metalMaterial}>
            <boxGeometry args={[zLength, zHeight, zThickness]} />
          </mesh>
          {/* Top flange (extends forward) */}
          <mesh castShadow receiveShadow position={[0, zHeight/2, zFlangeWidth/2]} material={metalMaterial}>
            <boxGeometry args={[zLength, zThickness, zFlangeWidth]} />
          </mesh>
          {/* Bottom flange (extends backward) */}
          <mesh castShadow receiveShadow position={[0, -zHeight/2, -zFlangeWidth/2]} material={metalMaterial}>
            <boxGeometry args={[zLength, zThickness, zFlangeWidth]} />
          </mesh>
        </group>
      );
    
    case "custom_profile":
      // Custom profile - show as octagonal bar
      const customLength = l * 1.2;
      const customSize = Math.max(w * 0.5, t * 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
          <cylinderGeometry args={[customSize, customSize, customLength, 8]} />
        </mesh>
      );
    
    case "custom":
      // Custom - generic irregular shape
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <dodecahedronGeometry args={[Math.max(d / 3, 0.4), 0]} />
        </mesh>
      );
    
    default:
      return (
        <mesh castShadow receiveShadow material={metalMaterial}>
          <boxGeometry args={[l, t, w]} />
        </mesh>
      );
  }
};

export const ThreeDViewer = (props: ThreeDViewerProps) => {
  const controlsRef = useRef<any>();
  const { scanDirections = [] } = props;

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Only re-render when part type or material changes, NOT dimensions
  const viewerKey = useMemo(() => {
    return `${props.partType}-${props.material}`;
  }, [props.partType, props.material]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border overflow-hidden">
      <Canvas key={viewerKey} shadows>
        <PerspectiveCamera makeDefault position={[3, 2, 3]} />
        <OrbitControls 
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={10}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, 10, 10]} intensity={0.5} />
        <directionalLight position={[0, -10, -10]} intensity={0.3} />
        
        {/* Environment for reflections */}
        <Environment preset="studio" />
        
        {/* Grid */}
        <gridHelper args={[10, 10, "#3b82f6", "#94a3b8"]} position={[0, -1, 0]} />
        
        {/* Part */}
        <Part {...props} />
        
        {/* Scan Direction Arrows */}
        {scanDirections && scanDirections.length > 0 && (
          <ScanDirectionArrows3D 
            scanDirections={scanDirections} 
            partScale={0.01}
          />
        )}
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleReset}
          className="shadow-lg"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset View
        </Button>
      </div>

      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-md p-3 border border-border shadow-lg">
        <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-2">
          <Navigation className="h-3 w-3" />
          Part Visualization
        </p>
        <p className="text-xs text-muted-foreground">
          {props.partType ? 
            `${props.partType.charAt(0).toUpperCase() + props.partType.slice(1)} • ${props.material || "No material"}` :
            "Configure part geometry"
          }
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {props.dimensions && `${props.dimensions.thickness}mm thick`}
        </p>
        {scanDirections && scanDirections.filter(s => s.isVisible).length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-primary">
              {scanDirections.filter(s => s.isVisible).length} Scan{scanDirections.filter(s => s.isVisible).length > 1 ? 's' : ''} Active
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
