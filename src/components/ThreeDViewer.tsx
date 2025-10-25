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
    // EXACT matches first (with underscores converted to spaces)
    if (normalizedPartType === 'flat bar' || normalizedPartType === 'plate') return 'plate';
    if (normalizedPartType === 'rectangular bar') return 'bar';
    if (normalizedPartType === 'round bar' || normalizedPartType === 'round forging stock') return 'round';
    if (normalizedPartType === 'hex bar') return 'hex';
    if (normalizedPartType === 'ring forging' || normalizedPartType === 'ring') return 'ring';
    if (normalizedPartType === 'disk forging' || normalizedPartType === 'disk') return 'disk';
    if (normalizedPartType === 'tube') return 'tube';
    if (normalizedPartType === 'bar') return 'bar';
    if (normalizedPartType === 'forging') return 'forging';
    
    // Partial matches as fallback (for variations)
    if (normalizedPartType.includes('ring')) return 'ring';
    if (normalizedPartType.includes('disk')) return 'disk';
    if (normalizedPartType.includes('tube') || normalizedPartType.includes('pipe')) return 'tube';
    if (normalizedPartType.includes('hex')) return 'hex';
    if (normalizedPartType.includes('round') || normalizedPartType.includes('cylinder')) return 'round';
    if (normalizedPartType.includes('flat') || normalizedPartType.includes('plate')) return 'plate';
    if (normalizedPartType.includes('forging')) return 'forging';
    if (normalizedPartType.includes('bar') || normalizedPartType.includes('rectangular')) return 'bar';
    
    return 'plate'; // default
  };

  const geometryType = getGeometryType();

  switch (geometryType) {
    case "plate":
      // Wide, flat sheet - emphasize width and length, minimize thickness
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l, t, w]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "bar":
      // Long, narrow beam - emphasize length, small cross-section
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l, w * 0.3, t * 0.3]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "forging":
      // Irregular, bulky shape - uneven proportions
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[l * 0.9, w * 1.3, t * 0.7]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "tube":
      // Long hollow cylinder with REAL hole
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
    
    case "ring":
      // Ring Forging - hollow cylinder with REAL hole
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
      // Disk Forging - flat, solid circular shape
      const diskRadius = Math.max(d / 2, 0.5);
      const diskHeight = Math.max(t, 0.1);
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[diskRadius, diskRadius, diskHeight, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "hex":
      // Hex Bar - hexagonal prism
      const hexRadius = Math.max(w * 0.5, 0.2);
      const hexHeight = Math.max(l, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[hexRadius, hexRadius, hexHeight, 6]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "round":
      // Round Bar / Cylinder - solid round stock
      const roundRadius = Math.max(d / 2, 0.2);
      const roundHeight = Math.max(l, 0.5);
      return (
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[roundRadius, roundRadius, roundHeight, 32]} />
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
