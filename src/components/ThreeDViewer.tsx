import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { PartGeometry, MaterialType } from "@/types/techniqueSheet";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useRef } from "react";

interface ThreeDViewerProps {
  partType: PartGeometry | "";
  material?: MaterialType | "";
  dimensions?: {
    length: number;
    width: number;
    thickness: number;
    diameter?: number;
  };
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

const Part = ({ partType, material, dimensions = { length: 100, width: 50, thickness: 10, diameter: 50 } }: ThreeDViewerProps) => {
  const color = getMaterialColor(material);
  const { length, width, thickness, diameter } = dimensions;

  // Scale down for better viewing (convert mm to scene units)
  const scale = 0.01;
  const l = length * scale;
  const w = width * scale;
  const t = thickness * scale;
  const d = (diameter || 50) * scale;

  if (!partType || l === 0 || w === 0 || t === 0) {
    return (
      <mesh>
        <boxGeometry args={[1, 0.5, 0.5]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.3} />
      </mesh>
    );
  }

  switch (partType) {
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
      // Long hollow cylinder - horizontal orientation
      return (
        <group>
          {/* Outer cylinder */}
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[d / 2, d / 2, l, 32]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
          </mesh>
          {/* Inner cylinder (hollow) */}
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[(d / 2) - (t / 2), (d / 2) - (t / 2), l + 0.01, 32]} />
            <meshStandardMaterial color="#1E1E1E" metalness={0.5} roughness={0.5} side={1} />
          </mesh>
        </group>
      );
    
    case "ring":
      // Donut/torus shape - thick ring
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[d / 2, t / 2, 20, 32]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
        </mesh>
      );
    
    case "disk":
      // Flat, round coin shape - wide diameter, minimal thickness
      return (
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[d / 2, d / 2, t * 0.5, 32]} />
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

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border overflow-hidden">
      <Canvas shadows>
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
        <p className="text-xs font-medium text-foreground mb-1">Part Visualization</p>
        <p className="text-xs text-muted-foreground">
          {props.partType ? 
            `${props.partType.charAt(0).toUpperCase() + props.partType.slice(1)} • ${props.material || "No material"}` :
            "Configure part geometry"
          }
        </p>
      </div>
    </div>
  );
};
