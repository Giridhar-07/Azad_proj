import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { useScroll as useFramerScroll, useTransform } from 'framer-motion';

const TechSphere: React.FC = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef(new Vector3(0, 0, 0));
  const initialColor = '#4444ff';
  const hoverColor = '#00ff88';
  
  // Scroll-based animations
  const { scrollYProgress } = useFramerScroll();
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const yPosition = useTransform(scrollYProgress, [0, 1], [0, -1]);

  useFrame((state) => {
    if (!sphereRef.current) return;

    // Smooth mouse follow effect
    const mouseX = (state.mouse.x * state.viewport.width) / 3;
    const mouseY = (state.mouse.y * state.viewport.height) / 3;
    targetPosition.current.set(mouseX, mouseY, 0);
    
    // Apply scroll-based transformations
    const currentScale = scale.get();
    const currentYPosition = yPosition.get();
    
    sphereRef.current.position.lerp(targetPosition.current, 0.1);
    sphereRef.current.position.y = currentYPosition;
    sphereRef.current.scale.set(currentScale, currentScale, currentScale);
    sphereRef.current.rotation.x += 0.01;
    sphereRef.current.rotation.y += 0.01;
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color={initialColor}
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
};

export default TechSphere;