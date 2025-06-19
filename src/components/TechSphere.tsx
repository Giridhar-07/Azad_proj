import React from 'react';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const TechSphere: React.FC = () => {
  return (
    <Sphere args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#4444ff"
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

export default TechSphere;