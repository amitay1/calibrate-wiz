import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cone, Html } from "@react-three/drei";
import * as THREE from "three";
import { ScanDirectionArrow } from "./ThreeDViewer";

interface ScanDirectionArrows3DProps {
  scanDirections: ScanDirectionArrow[];
  partScale: number;
}

const getScanColor = (direction: string): string => {
  // Professional color mapping for different scan directions
  const colors: { [key: string]: string } = {
    "A": "#FF6B6B", // Vibrant Red
    "B": "#4ECDC4", // Teal
    "C": "#45B7D1", // Sky Blue
    "D": "#FFA07A", // Light Salmon
    "E": "#98D8C8", // Mint
    "F": "#F7DC6F", // Golden Yellow
    "G": "#BB8FCE", // Lavender Purple
    "H": "#85C1E2", // Powder Blue
    "I": "#F8B739", // Amber Orange
    "L": "#52BE80"  // Emerald Green
  };
  return colors[direction] || "#888888";
};

const ScanArrow = ({ 
  position, 
  rotation, 
  color, 
  label 
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  color: string; 
  label: string;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const arrowLength = 0.4; // Much shorter arrow
  const arrowRadius = 0.03;
  const coneHeight = 0.12;
  const coneRadius = 0.06;

  // Gentle pulsing animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Arrow shaft with gradient effect */}
      <mesh position={[0, arrowLength / 2, 0]} castShadow>
        <cylinderGeometry args={[arrowRadius, arrowRadius * 1.2, arrowLength, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glowing ring at base - smaller */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[arrowRadius * 1.5, arrowRadius * 0.25, 12, 24]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Arrow cone head */}
      <Cone 
        args={[coneRadius, coneHeight, 16]} 
        position={[0, arrowLength + coneHeight / 2, 0]}
        castShadow
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </Cone>
      
      {/* Professional label with shadow - closer */}
      <Html position={[0, arrowLength + coneHeight + 0.2, 0]} distanceFactor={6}>
        <div 
          className="px-2.5 py-1 rounded-full font-bold text-xs shadow-2xl border-2 whitespace-nowrap pointer-events-none"
          style={{ 
            backgroundColor: color,
            color: '#ffffff',
            borderColor: color,
            boxShadow: `0 0 30px ${color}99, 0 4px 10px rgba(0,0,0,0.3)`,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
};

export const ScanDirectionArrows3D = ({ scanDirections, partScale }: ScanDirectionArrows3DProps) => {
  const visibleScans = scanDirections.filter(scan => scan.isVisible);
  
  if (visibleScans.length === 0) return null;

  const getArrowPositionAndRotation = (scan: ScanDirectionArrow, index: number) => {
    const color = getScanColor(scan.direction);
    
    // Distribute arrows in a circle around the part, each at unique position
    const angle = (index / visibleScans.length) * Math.PI * 2;
    const baseRadius = 0.85;
    
    // Determine position and rotation based on scan path (MIL-STD-2154)
    const waveMode = scan.waveMode.toLowerCase();
    
    let position: [number, number, number] = [0, 0, 0];
    let rotation: [number, number, number] = [0, 0, 0];
    let label = `${scan.direction}: ${scan.waveMode}`;
    
    // IMPORTANT: Check more specific patterns FIRST before general ones
    // "Axial shear wave" contains both "axial" and "shear", so check "shear" combinations first
    
    // Check for pure Axial FIRST (before checking shear combinations)
    if ((waveMode.includes('axial') || waveMode.includes('longitudinal') || waveMode.includes('straight')) 
        && !waveMode.includes('shear') && !waveMode.includes('circumferential')) {
      // Pure Axial/Longitudinal - Vertical arrows pointing DOWN from above
      // Position well above the part for clear visibility
      position = [Math.cos(angle) * baseRadius * 0.6, 1.0, Math.sin(angle) * baseRadius * 0.6];
      rotation = [Math.PI, 0, 0]; // Pointing DOWN (180° flip)
      label = `${scan.direction}: Axial`;
    } else if (waveMode.includes('shear') || waveMode.includes('circumferential') || 
        waveMode.includes('clockwise') || waveMode.includes('counter')) {
      // Shear/Circumferential - Arrows at angle (Ring Forgings style)
      // Position on the side, angled
      position = [Math.cos(angle) * baseRadius * 1.1, 0.3, Math.sin(angle) * baseRadius * 1.1];
      rotation = [Math.PI / 4, -angle, Math.PI / 2]; // Angled shear direction
      label = `${scan.direction}: Shear`;
    } else if (waveMode.includes('radial') || waveMode.includes('od') || waveMode.includes('id')) {
      // Radial - Horizontal arrows pointing INWARD to center (Ring Forgings style)
      position = [Math.cos(angle) * baseRadius * 1.2, 0, Math.sin(angle) * baseRadius * 1.2];
      rotation = [0, -angle, Math.PI / 2]; // Pointing toward center
      label = `${scan.direction}: Radial`;
    } else {
      // Default - Axial pointing down
      position = [Math.cos(angle) * baseRadius * 0.6, 1.0, Math.sin(angle) * baseRadius * 0.6];
      rotation = [Math.PI, 0, 0]; // Pointing DOWN
      label = `${scan.direction}: Default`;
    }
    
    return { position, rotation, color, label };
  };

  return (
    <group>
      {visibleScans.map((scan, index) => {
        const { position, rotation, color, label } = getArrowPositionAndRotation(scan, index);
        
        return (
          <ScanArrow
            key={`${scan.direction}-${index}`}
            position={position}
            rotation={rotation}
            color={color}
            label={label}
          />
        );
      })}
    </group>
  );
};
