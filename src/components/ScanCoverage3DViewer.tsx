import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { DEPTH_ZONE_COLORS } from '@/utils/technicalDrawings/advancedScanCoverage';
import { Box } from 'lucide-react';

interface ScanCoverage3DViewerProps {
  partType: string;
  dimensions: {
    length: number;
    width: number;
    thickness: number;
    diameter?: number;
  };
  scans?: Array<{
    id: string;
    name: string;
    waveType: string;
    beamAngle: number;
    side: 'A' | 'B';
  }>;
  depthZones: Array<{
    startDepth: number;
    endDepth: number;
    color: string;
    label: string;
    waveType: 'longitudinal' | 'shear';
    beamAngle: number;
  }>;
}

// Component to render a single depth zone layer
function DepthZoneLayer({ 
  startDepth, 
  endDepth, 
  color, 
  length, 
  width, 
  totalThickness,
  label,
  index
}: { 
  startDepth: number;
  endDepth: number;
  color: string;
  length: number;
  width: number;
  totalThickness: number;
  label: string;
  index: number;
}) {
  const layerThickness = endDepth - startDepth;
  const scale = 0.05; // Scale factor for visualization
  
  // Calculate position (from top, going down)
  const positionY = (totalThickness / 2 - startDepth - layerThickness / 2) * scale;
  
  return (
    <group position={[0, positionY, 0]}>
      {/* Main layer box */}
      <mesh>
        <boxGeometry args={[length * scale, layerThickness * scale, width * scale]} />
        <meshStandardMaterial 
          color={color}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Layer outline */}
      <lineSegments>
        <edgesGeometry 
          args={[new THREE.BoxGeometry(length * scale, layerThickness * scale, width * scale)]} 
        />
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>
      
      {/* Depth label */}
      <Text
        position={[length * scale / 2 + 2, 0, 0]}
        fontSize={0.4}
        color={color}
        anchorX="left"
        anchorY="middle"
      >
        {label}
        {'\n'}
        {startDepth.toFixed(1)}-{endDepth.toFixed(1)}mm
      </Text>
    </group>
  );
}

// Component to render ultrasonic beam
function UltrasonicBeam({ 
  beamAngle, 
  length, 
  thickness,
  side 
}: { 
  beamAngle: number;
  length: number;
  thickness: number;
  side: 'A' | 'B';
}) {
  const scale = 0.05;
  const beamLength = thickness * scale * 1.5;
  
  // Calculate beam direction based on angle
  const angleRad = (beamAngle * Math.PI) / 180;
  
  // Beam position and rotation
  const startX = side === 'A' ? -length * scale / 2 - 1 : length * scale / 2 + 1;
  const startY = thickness * scale / 2;
  
  const beamPath = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(
        Math.sin(angleRad) * beamLength,
        -Math.cos(angleRad) * beamLength,
        0
      )
    ]);
    return curve;
  }, [angleRad, beamLength]);
  
  return (
    <group position={[startX, startY, 0]}>
      {/* Main beam cone */}
      <mesh rotation={[0, 0, -angleRad]}>
        <coneGeometry args={[0.5, beamLength, 8, 1, true]} />
        <meshStandardMaterial
          color="#00FFFF"
          transparent
          opacity={0.3}
          emissive="#00FFFF"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Beam center line */}
      <mesh rotation={[0, 0, -angleRad]}>
        <cylinderGeometry args={[0.05, 0.05, beamLength, 8]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#00FFFF"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Beam angle label */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.5}
        color="#00FFFF"
        anchorX="center"
        anchorY="bottom"
      >
        {beamAngle}° Beam
      </Text>
      
      {/* Wave particles animation */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(angleRad) * (beamLength / 5) * i,
            -Math.cos(angleRad) * (beamLength / 5) * i,
            0
          ]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00FFFF"
            emissiveIntensity={1 - i * 0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main part geometry (simplified box for now)
function PartGeometry({ length, width, thickness }: { 
  length: number;
  width: number;
  thickness: number;
}) {
  const scale = 0.05;
  
  return (
    <group>
      {/* Semi-transparent part outline */}
      <mesh>
        <boxGeometry args={[length * scale, thickness * scale, width * scale]} />
        <meshStandardMaterial
          color="#CCCCCC"
          transparent
          opacity={0.1}
          wireframe={false}
        />
      </mesh>
      
      {/* Wireframe overlay */}
      <lineSegments>
        <edgesGeometry 
          args={[new THREE.BoxGeometry(length * scale, thickness * scale, width * scale)]} 
        />
        <lineBasicMaterial color="#000000" linewidth={2} />
      </lineSegments>
      
      {/* Dimension labels */}
      <Text
        position={[0, -thickness * scale / 2 - 1, 0]}
        fontSize={0.5}
        color="#000000"
        anchorX="center"
      >
        {length}mm × {width}mm × {thickness}mm
      </Text>
    </group>
  );
}

// Grid helper
function SceneGrid() {
  return (
    <>
      <gridHelper args={[20, 20, '#888888', '#CCCCCC']} />
      <axesHelper args={[5]} />
    </>
  );
}

export function ScanCoverage3DViewer({
  partType,
  dimensions,
  scans = [],
  depthZones
}: ScanCoverage3DViewerProps) {
  const { length, width, thickness } = dimensions;
  
  // Show message if no depth zones
  if (depthZones.length === 0) {
    return (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 rounded-lg border border-border">
        <div className="text-center space-y-2">
          <Box className="w-16 h-16 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">No Scan Data Available</h3>
          <p className="text-muted-foreground">
            Add scans in the Scan Details tab to see 3D coverage visualization
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-b from-background to-secondary/20 rounded-lg border border-border relative">
      <Canvas shadows>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -5]} intensity={0.3} color="#4488FF" />
        <pointLight position={[10, -10, 5]} intensity={0.3} color="#FF4444" />
        
        {/* Scene elements */}
        <SceneGrid />
        
        {/* Part geometry */}
        <PartGeometry length={length} width={width} thickness={thickness} />
        
        {/* Depth zone layers */}
        {depthZones.map((zone, index) => (
          <DepthZoneLayer
            key={index}
            startDepth={zone.startDepth}
            endDepth={zone.endDepth}
            color={zone.color}
            length={length}
            width={width}
            totalThickness={thickness}
            label={zone.label}
            index={index}
          />
        ))}
        
        {/* Ultrasonic beams */}
        {scans.map((scan, index) => (
          <UltrasonicBeam
            key={scan.id}
            beamAngle={scan.beamAngle}
            length={length}
            thickness={thickness}
            side={scan.side}
          />
        ))}
        
        {/* Title text */}
        <Text
          position={[0, thickness * 0.05 + 3, 0]}
          fontSize={0.8}
          color="#000000"
          anchorX="center"
          anchorY="bottom"
        >
          3D Scan Coverage Visualization
        </Text>
        
        {/* Interactive controls */}
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border text-sm space-y-1">
        <p className="font-semibold">🖱️ Interactive Controls:</p>
        <p>• <strong>Left Click + Drag:</strong> Rotate view</p>
        <p>• <strong>Right Click + Drag:</strong> Pan</p>
        <p>• <strong>Scroll:</strong> Zoom in/out</p>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border text-sm space-y-2 max-w-xs">
        <p className="font-semibold">🎨 Depth Zones:</p>
        {depthZones.map((zone, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-border flex-shrink-0"
              style={{ backgroundColor: zone.color }}
            />
            <span className="text-xs">
              {zone.label} ({zone.startDepth.toFixed(0)}-{zone.endDepth.toFixed(0)}mm)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
