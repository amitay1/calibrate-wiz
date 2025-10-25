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
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
          
          {/* Lighting setup for metallic look */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.5} />
          <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
          
          {/* Rim lighting for pop effect */}
          <spotLight
            position={[0, 0, 10]}
            angle={0.3}
            penumbra={1}
            intensity={0.5}
            color={color}
          />
          
          {/* Environment for reflections */}
          <Environment preset="studio" />
          
          {/* The actual 3D shape */}
          <Shape3DMesh 
            partType={partType} 
            color={color}
            isHovered={isHovered}
            mouseX={mouseX}
            mouseY={mouseY}
          />
          
          {/* Optional: Add a subtle ground plane for shadows */}
          {isHovered && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <shadowMaterial opacity={0.2} />
            </mesh>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
