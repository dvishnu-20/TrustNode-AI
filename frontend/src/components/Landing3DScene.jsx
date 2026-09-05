import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function NodeSystem(props) {
  const ref = useRef();
  
  // Generate random points in a sphere
  const [positions, mathColors] = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 2.5 + Math.random() * 1.5;
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions.set([x, y, z], i * 3);

      // TrustNode colors (cyan, red, yellow, slate)
      const colorMix = Math.random();
      const color = new THREE.Color();
      if (colorMix > 0.8) {
        color.set('#00C2A8'); // Cyan
      } else if (colorMix > 0.7) {
        color.set('#ef4444'); // Red
      } else if (colorMix > 0.6) {
        color.set('#eab308'); // Yellow
      } else {
        color.set('#334155'); // Slate
      }
      colors.set([color.r, color.g, color.b], i * 3);
    }
    
    return [positions, colors];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} colors={mathColors} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          vertexColors
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default function Landing3DScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <fog attach="fog" args={['#03090B', 2, 8]} />
        <ambientLight intensity={0.5} />
        <NodeSystem />
      </Canvas>
    </div>
  );
}
