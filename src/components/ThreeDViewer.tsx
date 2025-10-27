import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { PartGeometry, MaterialType } from "@/types/techniqueSheet";
import { Button } from "@/components/ui/button";
import { RotateCcw, Navigation } from "lucide-react";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { ScanDirectionArrows3D } from "./ScanDirectionArrows3D";

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

const getMaterialColor = (material: MaterialType | ""): string => {
  switch (material) {
    case "aluminum": return "#C0C0C8";
    case "steel": return "#808088";
    case "titanium": return "#999999";
    case "magnesium": return "#B0B0B8";
    default: return "#A0A0A0";
  }
};

// Component for hollow tube with real hole
const HollowTube = ({ color, outerRadius, innerRadius, length }: { color: string; outerRadius: number; innerRadius: number; length: number }) => {
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
  
  return (
    <mesh castShadow receiveShadow geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Component for hollow ring with real hole
const HollowRing = ({ color, outerRadius, innerRadius, height }: { color: string; outerRadius: number; innerRadius: number; height: number }) => {
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
  
  return (
    <mesh castShadow receiveShadow geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Part = ({ partType, material, dimensions = { length: 100, width: 50, thickness: 10, diameter: 50 } }: ThreeDViewerProps) => {
  const color = getMaterialColor(material);
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
    if (normalizedPartType === 'ring forging') return 'ring';
    if (normalizedPartType === 'disk forging') return 'disk';
    if (normalizedPartType === 'hub') return 'hub';
    if (normalizedPartType === 'shaft') return 'shaft';
    if (normalizedPartType === 'near net forging') return 'forging';
    
    // ===== ROLLED BILLET OR PLATE =====
    if (normalizedPartType === 'billet') return 'billet';
    if (normalizedPartType === 'plate') return 'plate';
    if (normalizedPartType === 'sheet') return 'sheet';
    if (normalizedPartType === 'slab') return 'slab';
    
    // ===== EXTRUDED OR ROLLED BARS =====
    if (normalizedPartType === 'round bar') return 'round_bar';
    if (normalizedPartType === 'square bar') return 'square_bar';
    if (normalizedPartType === 'rectangular bar') return 'rectangular_bar';
    if (normalizedPartType === 'hex bar') return 'hex';
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
    if (normalizedPartType === 'ring') return 'ring';
    if (normalizedPartType === 'disk') return 'disk';
    if (normalizedPartType === 'cylinder') return 'cylinder';
    if (normalizedPartType === 'sphere') return 'sphere';
    if (normalizedPartType === 'cone') return 'cone';
    if (normalizedPartType === 'sleeve') return 'sleeve';
    if (normalizedPartType === 'bushing') return 'bushing';
    if (normalizedPartType === 'block') return 'block';
    if (normalizedPartType === 'custom') return 'custom';
    
    // ===== FALLBACK CHECKS (for partial matches) =====
    if (normalizedPartType.includes('plate') || normalizedPartType.includes('sheet')) return 'plate';
    if (normalizedPartType.includes('tube') || normalizedPartType.includes('pipe')) return 'tube';
    if (normalizedPartType.includes('disk')) return 'disk';
    if (normalizedPartType.includes('ring')) return 'ring';
    if (normalizedPartType.includes('forging')) return 'forging';
    if (normalizedPartType.includes('billet') || normalizedPartType.includes('block')) return 'billet';
    if (normalizedPartType.includes('sleeve') || normalizedPartType.includes('bushing')) return 'sleeve';
    if (normalizedPartType.includes('round') || normalizedPartType.includes('cylinder')) return 'round';
    if (normalizedPartType.includes('hex')) return 'hex';
    if (normalizedPartType.includes('square')) return 'square';
    if (normalizedPartType.includes('bar') || normalizedPartType.includes('extrusion')) return 'bar';
    
    return 'plate'; // default
  };

  const geometryType = getGeometryType();

  switch (geometryType) {
    // ===== ROLLED BILLET OR PLATE =====
    case "plate":
      // Plate - medium thickness, wide and long
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l, t * 0.6, w]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "sheet":
      // Sheet - very thin, maximum width and length
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l * 1.2, t * 0.2, w * 1.2]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "slab":
      // Slab - thicker than plate, heavy rectangular block
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l * 0.9, t * 1.5, w * 0.9]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "billet":
      // Billet - large, thick, nearly cubic block
      const billetSize = Math.max(w, t, l * 0.5);
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[billetSize, billetSize * 0.9, billetSize * 0.85]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    // ===== FORGING STOCK =====
    case "round_forging_stock":
      // Round forging stock - long cylinder, thicker than bar
      const rfsRadius = Math.max(d / 2, 0.4);
      const rfsLength = Math.max(l * 1.2, 1);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[rfsRadius, rfsRadius, rfsLength, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "rectangular_forging_stock":
      // Rectangular forging stock - thick rectangular bar
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l * 1.1, w * 0.7, t * 0.7]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    // ===== FORGINGS =====
    case "forging":
      // Near-net forging - organic, smooth irregular shape
      const forgingRadius = Math.max(d / 2, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 6]}>
          <icosahedronGeometry args={[forgingRadius, 3]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.85} 
            roughness={0.25}
            flatShading={false}
          />
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
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[hubRadius, hubRadius, hubHeight, 32]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, bossHeight * 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[bossRadius, bossRadius * 0.9, bossHeight, 32]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      );
    
    case "shaft":
      // Shaft - long, slender cylinder with steps
      const shaftRadius = Math.max(d / 2, 0.25);
      const shaftLength = Math.max(l * 1.5, 1.5);
      return (
        <group>
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 32]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh castShadow receiveShadow position={[shaftLength * 0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[shaftRadius * 1.3, shaftRadius * 1.3, shaftLength * 0.2, 32]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      );
    
    // ===== BARS =====
    case "round_bar":
      // Round bar - standard cylinder, medium length
      const rbRadius = Math.max(d / 2, 0.2);
      const rbLength = Math.max(l, 0.8);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[rbRadius, rbRadius, rbLength, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "square_bar":
      // Square bar - square cross-section
      const sbSize = Math.max(w * 0.5, 0.2);
      const sbLength = Math.max(l, 0.8);
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[sbLength, sbSize, sbSize]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "rectangular_bar":
      // Rectangular bar - wider than tall
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l, t * 0.4, w * 0.6]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "flat_bar":
      // Flat bar - very wide, very thin
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l, t * 0.3, w * 0.9]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
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
          color={color} 
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
          color={color} 
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
          <mesh castShadow receiveShadow>
            <boxGeometry args={[rtOuterL, rtOuterW, rtOuterT]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
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
          <mesh castShadow receiveShadow>
            <boxGeometry args={[stLength, stSize, stSize]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
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
          color={color} 
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
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[diskRadius, diskRadius, diskHeight, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    // ===== OTHER SHAPES =====
    case "cylinder":
      // Cylinder - medium height cylinder
      const cylRadius = Math.max(d / 2, 0.3);
      const cylHeight = Math.max(w, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[cylRadius, cylRadius, cylHeight, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "sphere":
      // Sphere - perfect sphere
      const sphereRadius = Math.max(d / 2, 0.4);
      return (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[sphereRadius, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "cone":
      // Cone - tapered cylinder
      const coneRadius = Math.max(d / 2, 0.3);
      const coneHeight = Math.max(w, 0.6);
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[coneRadius, coneHeight, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "hex":
      // Hex bar - hexagonal prism
      const hexRadius = Math.max(w * 0.5, 0.2);
      const hexHeight = Math.max(l, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[hexRadius, hexRadius, hexHeight, 6]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "sleeve":
      // Sleeve - longer, thinner walls
      const sleeveOuterRadius = d / 2;
      const sleeveInnerRadius = Math.max((d / 2) - t * 0.6, 0.05);
      const sleeveLength = Math.max(l * 0.7, w * 0.8);
      return (
        <HollowTube 
          color={color} 
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
          color={color} 
          outerRadius={bushingOuterRadius} 
          innerRadius={bushingInnerRadius} 
          length={bushingLength} 
        />
      );
    
    case "block":
      // Block - compact rectangular
      const blockSize = Math.min(l, w, t);
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[blockSize, blockSize * 0.8, blockSize * 0.9]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "machined_component":
      // Machined component - complex stepped shape
      return (
        <group>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[l * 0.7, w * 0.6, t * 0.6]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh castShadow receiveShadow position={[l * 0.2, 0, 0]}>
            <boxGeometry args={[l * 0.3, w * 0.8, t * 0.8]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      );
    
    // ===== EXTRUSIONS =====
    case "extrusion_angle":
    case "extrusion_t":
    case "extrusion_i":
    case "extrusion_u":
    case "extrusion_channel":
    case "z_section":
    case "custom_profile":
      // Complex profiles - show as bar with distinguishing feature
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l, w * 0.4, t * 0.4]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "custom":
      // Custom - generic irregular shape
      return (
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[Math.max(d / 3, 0.4), 0]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    default:
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l, t, w]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
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
