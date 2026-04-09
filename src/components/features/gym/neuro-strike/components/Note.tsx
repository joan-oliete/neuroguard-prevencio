/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef } from 'react';
import { Extrude, Octahedron, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NoteData, COLORS } from '../types';
import { LANE_X_POSITIONS, LAYER_Y_POSITIONS, NOTE_SIZE } from '../constants';

interface NoteProps {
    data: NoteData;
    zPos: number;
    currentTime: number;
}

const RISK_ICONS: Record<string, string> = {
    gambling: "🎲",
    screens: "📱",
    gaming: "🎮",
    shopping: "🛍️",
    porn: "🔞",
    default: "⚡"
};

// Shape Generator
const createSparkShape = (size: number) => {
    const shape = new THREE.Shape();
    const s = size / 1.8;
    shape.moveTo(0, s);
    shape.quadraticCurveTo(0, 0, s, 0);
    shape.quadraticCurveTo(0, 0, 0, -s);
    shape.quadraticCurveTo(0, 0, -s, 0);
    shape.quadraticCurveTo(0, 0, 0, s);
    return shape;
};

const SPARK_SHAPE = createSparkShape(NOTE_SIZE);
const EXTRUDE_SETTINGS = { depth: NOTE_SIZE * 0.4, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };

const Debris: React.FC<{ data: NoteData, timeSinceHit: number, color: string }> = ({ data, timeSinceHit, color }) => {
    const groupRef = useRef<THREE.Group>(null);
    const flashRef = useRef<THREE.Mesh>(null);

    const flySpeed = 6.0;
    const rotationSpeed = 10.0;
    const distance = flySpeed * timeSinceHit;

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.scale.setScalar(Math.max(0.01, 1 - timeSinceHit * 1.5));
        }
        if (flashRef.current) {
            const flashDuration = 0.15;
            if (timeSinceHit < flashDuration) {
                const t = timeSinceHit / flashDuration;
                flashRef.current.visible = true;
                flashRef.current.scale.setScalar(1 + t * 4);
                (flashRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - t;
            } else {
                flashRef.current.visible = false;
            }
        }
    });

    const Shard = ({ offsetDir, moveDir, scale = 1 }: { offsetDir: number[], moveDir: number[], scale?: number }) => {
        const meshRef = useRef<THREE.Mesh>(null);
        useFrame(() => {
            if (meshRef.current) {
                meshRef.current.position.set(
                    offsetDir[0] + moveDir[0] * distance,
                    offsetDir[1] + moveDir[1] * distance,
                    offsetDir[2] + moveDir[2] * distance
                );
                meshRef.current.rotation.x += moveDir[1] * rotationSpeed * 0.1;
                meshRef.current.rotation.y += moveDir[0] * rotationSpeed * 0.1;
            }
        });

        return (
            <Octahedron ref={meshRef} args={[NOTE_SIZE * 0.3 * scale]} position={[offsetDir[0], offsetDir[1], offsetDir[2]]}>
                <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} emissive={color} emissiveIntensity={0.5} />
            </Octahedron>
        )
    }

    return (
        <group ref={groupRef}>
            <mesh ref={flashRef}>
                <sphereGeometry args={[NOTE_SIZE * 1.2, 16, 16]} />
                <meshBasicMaterial color="white" transparent toneMapped={false} />
            </mesh>
            <Shard offsetDir={[0, 0.2, 0]} moveDir={[0, 1.5, -0.5]} scale={0.8} />
            <Shard offsetDir={[0.2, 0, 0]} moveDir={[1.5, 0, -0.5]} scale={0.8} />
            <Shard offsetDir={[0, -0.2, 0]} moveDir={[0, -1.5, -0.5]} scale={0.8} />
            <Shard offsetDir={[-0.2, 0, 0]} moveDir={[-1.5, 0, -0.5]} scale={0.8} />
        </group>
    );
};

const Note: React.FC<NoteProps> = ({ data, zPos, currentTime }) => {
    const color = data.type === 'left' ? COLORS.left : COLORS.right;
    const icon = data.riskType ? RISK_ICONS[data.riskType] : RISK_ICONS.default;

    const position: [number, number, number] = useMemo(() => {
        return [
            LANE_X_POSITIONS[data.lineIndex],
            LAYER_Y_POSITIONS[data.lineLayer],
            zPos
        ];
    }, [data.lineIndex, data.lineLayer, zPos]);

    if (data.missed) return null;

    if (data.hit && data.hitTime) {
        return (
            <group position={position}>
                <Debris data={data} timeSinceHit={currentTime - data.hitTime} color={color} />
            </group>
        );
    }

    return (
        <group position={position}>
            {/* Shape Body */}
            <group position={[0, 0, -NOTE_SIZE * 0.2]}>
                <Extrude args={[SPARK_SHAPE, EXTRUDE_SETTINGS]} castShadow receiveShadow>
                    <meshPhysicalMaterial
                        color={color}
                        roughness={0.2}
                        metalness={0.1}
                        transmission={0.1}
                        thickness={0.5}
                        emissive={color}
                        emissiveIntensity={0.8}
                    />
                </Extrude>
            </group>

            {/* Icon Text */}
            <group position={[0, 0, NOTE_SIZE * 0.35]}>
                <Text
                    fontSize={0.4}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor={color}
                >
                    {icon}
                </Text>
            </group>

            {/* Wireframe Overlay */}
            <group position={[0, 0, -NOTE_SIZE * 0.2]}>
                <mesh>
                    <extrudeGeometry args={[SPARK_SHAPE, { ...EXTRUDE_SETTINGS, depth: EXTRUDE_SETTINGS.depth * 1.1 }]} />
                    <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
                </mesh>
            </group>
        </group>
    );
};

export default React.memo(Note, (prev, next) => {
    if (next.data.hit) return false;
    return prev.zPos === next.zPos && prev.data.hit === next.data.hit && prev.data.missed === next.data.missed;
});
