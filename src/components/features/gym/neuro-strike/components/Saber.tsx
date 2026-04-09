/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HandType, COLORS } from '../types';

interface SaberProps {
    type: HandType;
    positionRef: React.MutableRefObject<THREE.Vector3 | null>;
    velocityRef: React.MutableRefObject<THREE.Vector3 | null>;
}

const Saber: React.FC<SaberProps> = ({ type, positionRef, velocityRef }) => {
    const meshRef = useRef<THREE.Group>(null);
    const saberLength = 1.0;
    const color = type === 'left' ? COLORS.left : COLORS.right;

    // Reusable rotation objects
    const targetRotation = useRef(new THREE.Euler());

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const targetPos = positionRef.current;
        const velocity = velocityRef.current;

        if (targetPos) {
            meshRef.current.visible = true;
            // Smooth movement
            meshRef.current.position.lerp(targetPos, 0.5);

            // Dynamic Rotation logic
            const restingX = -Math.PI / 3.5;
            const restingY = 0;
            const restingZ = type === 'left' ? 0.2 : -0.2;

            let swayX = 0;
            let swayY = 0;
            let swayZ = 0;

            if (velocity) {
                swayX = velocity.y * 0.05;
                swayZ = -velocity.x * 0.05;
                swayX += velocity.z * 0.02;
            }

            targetRotation.current.set(
                restingX + swayX,
                restingY + swayY,
                restingZ + swayZ
            );

            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.current.x, 0.2);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.current.y, 0.2);
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation.current.z, 0.2);

        } else {
            meshRef.current.visible = false;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Handle */}
            <mesh position={[0, -0.06, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.12, 16]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
            </mesh>

            {/* Blade Core */}
            <mesh position={[0, 0.05 + saberLength / 2, 0]}>
                <cylinderGeometry args={[0.008, 0.008, saberLength, 12]} />
                <meshBasicMaterial color="white" toneMapped={false} />
            </mesh>

            {/* Blade Glow */}
            <mesh position={[0, 0.05 + saberLength / 2, 0]}>
                <capsuleGeometry args={[0.02, saberLength, 16, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={4}
                    toneMapped={false}
                    transparent
                    opacity={0.6}
                    roughness={0.1}
                    metalness={0}
                />
            </mesh>

            {/* Light */}
            <pointLight color={color} intensity={2} distance={3} decay={2} position={[0, 0.5, 0]} />
        </group>
    );
};

export default Saber;
