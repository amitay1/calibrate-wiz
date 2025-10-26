import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { getGeometryByType } from './ShapeGeometries';
import { getMaterialByType } from './ShapeMaterials';

interface Shape3DMeshProps {
  partType: string;
  color: string;
  isHovered: boolean;
  mouseX: number;
  mouseY: number;
}

function Shape3DMesh({ partType, color, isHovered, mouseX, mouseY }: Shape3DMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = getGeometryByType(partType);
  const material = getMaterialByType(partType);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (isHovered) {
      // Interactive rotation based on mouse position
      const targetRotX = (mouseY - 0.5) * 0.5;
      const targetRotY = (mouseX - 0.5) * 0.5;
      
      meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.1;
      
      // Pop out effect
      const targetZ = 0.3;
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.1;
      
      // Slight scale up
      const targetScale = 1.1;
      const currentScale = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(currentScale + (targetScale - currentScale) * 0.1);
    } else {
      // Gentle auto-rotation when not hovered
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
      
      // Return to original position
      meshRef.current.position.z += (0 - meshRef.current.position.z) * 0.1;
      
      // Return to original scale
      const currentScale = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(currentScale + (1 - currentScale) * 0.1);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material}>
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.3}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

interface Shape3DViewerProps {
  partType: string;
  color: string;
  isHovered: boolean;
  mouseX: number;
  mouseY: number;
}

export default function Shape3DViewer({ 
  partType, 
  color, 
  isHovered,
  mouseX,
  mouseY 
}: Shape3DViewerProps) {
  // Only render Canvas when hovered to save WebGL contexts
  if (!isHovered) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        gl={{ 
          antialias: false, // Disable for performance
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        dpr={1} // Fixed low DPR for performance
        frameloop="demand" // Only render when needed
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
          
          {/* Simplified lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          
          {/* The actual 3D shape */}
          <Shape3DMesh 
            partType={partType} 
            color={color}
            isHovered={isHovered}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
