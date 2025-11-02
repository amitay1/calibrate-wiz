import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { PartGeometry, MaterialType } from "@/types/techniqueSheet";
import { Button } from "@/components/ui/button";
import { RotateCcw, Navigation } from "lucide-react";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { ScanDirectionArrows3D } from "./ScanDirectionArrows3D";
import { getMaterialByMaterialType } from "./3d/ShapeMaterials";
import { getGeometryByType } from "./3d/ShapeGeometries";

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
    isHollow?: boolean;
    innerDiameter?: number;
    innerLength?: number;
    innerWidth?: number;
    wallThickness?: number;
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

const Part = ({ partType, material, dimensions }: ThreeDViewerProps) => {
  // Get metallic material based on material type (aerospace metals)
  const metalMaterial = useMemo(() => getMaterialByMaterialType(material), [material]);

  // Calculate scale based on dimensions
  const scale = useMemo((): [number, number, number] => {
    if (!dimensions) return [1, 1, 1];
    
    const baseSize = 1;
    const scaleX = dimensions.length ? dimensions.length / 100 : baseSize;
    const scaleY = dimensions.thickness ? dimensions.thickness / 50 : baseSize;
    const scaleZ = dimensions.width ? dimensions.width / 75 : baseSize;
    
    return [scaleX, scaleY, scaleZ];
  }, [dimensions]);

  if (!partType) {
    return (
      <mesh scale={scale}>
        <boxGeometry args={[1, 0.5, 0.5]} />
        <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.3} />
      </mesh>
    );
  }

  // Use the same geometry as Shape3DViewer for consistency
  const geometry = useMemo(() => {
    const params = {
      isHollow: dimensions?.isHollow,
      outerDiameter: dimensions?.diameter,
      innerDiameter: dimensions?.innerDiameter,
      length: dimensions?.length,
      width: dimensions?.width,
      thickness: dimensions?.thickness,
      innerLength: dimensions?.innerLength,
      innerWidth: dimensions?.innerWidth,
    };
    return getGeometryByType(partType, params);
  }, [partType, dimensions]);
  
  return (
    <mesh castShadow receiveShadow geometry={geometry} material={metalMaterial} scale={scale} />
  );
};

export const ThreeDViewer = (props: ThreeDViewerProps) => {
  const controlsRef = useRef<any>();
  const { scanDirections = [] } = props;

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Re-render when part type, material, or dimensions change
  const viewerKey = useMemo(() => {
    const dimKey = props.dimensions 
      ? `${props.dimensions.length}-${props.dimensions.width}-${props.dimensions.thickness}-${props.dimensions.diameter}`
      : 'no-dims';
    return `${props.partType}-${props.material}-${dimKey}`;
  }, [props.partType, props.material, props.dimensions]);

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
