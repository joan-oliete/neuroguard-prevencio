/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import * as THREE from 'three';

// Mapping 2D normalized coordinates to 3D game world.
const mapHandToWorld = (x: number, y: number): THREE.Vector3 => {
    const GAME_X_RANGE = 5;
    const GAME_Y_RANGE = 3.5;
    const Y_OFFSET = 0.8;

    // MediaPipe often returns mirrored X if facingMode is 'user'.
    // Depending on the final behavior we might need to invert.
    // Assuming standard mirroring where 0 is left-screen (user's right hand physically if mirrored).
    const worldX = (0.5 - x) * GAME_X_RANGE;
    const worldY = (1.0 - y) * GAME_Y_RANGE - (GAME_Y_RANGE / 2) + Y_OFFSET;

    // Z-depth simulation based on Y height or just fixed plane
    // For rhythm games, usually fixed Z or slightly dynamic
    const worldZ = -Math.max(0, worldY * 0.2);

    return new THREE.Vector3(worldX, Math.max(0.1, worldY), worldZ);
};

export const useMediaPipe = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handPositionsRef = useRef<{
        left: THREE.Vector3 | null;
        right: THREE.Vector3 | null;
        lastLeft: THREE.Vector3 | null;
        lastRight: THREE.Vector3 | null;
        leftVelocity: THREE.Vector3;
        rightVelocity: THREE.Vector3;
        lastTimestamp: number;
    }>({
        left: null,
        right: null,
        lastLeft: null,
        lastRight: null,
        leftVelocity: new THREE.Vector3(0, 0, 0),
        rightVelocity: new THREE.Vector3(0, 0, 0),
        lastTimestamp: 0
    });

    // To expose raw results for UI preview
    const lastResultsRef = useRef<HandLandmarkerResult | null>(null);

    const landmarkerRef = useRef<HandLandmarker | null>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        let isActive = true;

        const setupMediaPipe = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
                );

                if (!isActive) return;

                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 2,
                    minHandDetectionConfidence: 0.5,
                    minHandPresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                if (!isActive) {
                    landmarker.close();
                    return;
                }

                landmarkerRef.current = landmarker;
                startCamera();
            } catch (err: any) {
                console.error("Error initializing MediaPipe:", err);
                setError(`Failed to load hand tracking: ${err.message}`);
            }
        };

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                });

                if (videoRef.current && isActive) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadeddata = () => {
                        if (isActive) {
                            setIsCameraReady(true);
                            predictWebcam();
                        }
                    };
                }
            } catch (err) {
                console.error("Camera Error:", err);
                setError("Could not access camera. Please allow camera access.");
            }
        };

        const predictWebcam = () => {
            if (!videoRef.current || !landmarkerRef.current || !isActive) return;

            const video = videoRef.current;
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                let startTimeMs = performance.now();
                try {
                    const results = landmarkerRef.current.detectForVideo(video, startTimeMs);
                    lastResultsRef.current = results;
                    processResults(results);
                } catch (e) {
                    console.warn("Detection failed this frame", e);
                }
            }

            requestRef.current = requestAnimationFrame(predictWebcam);
        };

        const processResults = (results: HandLandmarkerResult) => {
            const now = performance.now();
            const deltaTime = (now - handPositionsRef.current.lastTimestamp) / 1000;
            handPositionsRef.current.lastTimestamp = now;

            let newLeft: THREE.Vector3 | null = null;
            let newRight: THREE.Vector3 | null = null;

            if (results.landmarks) {
                for (let i = 0; i < results.landmarks.length; i++) {
                    const landmarks = results.landmarks[i];
                    const classification = results.handedness[i][0];
                    // In 'user' facing mode (mirrored), Right hand appears on left of screen but is classified as "Right" by MediaPipe? 
                    // Wait, standard MediaPipe: 'Right' label means it IS the right hand.
                    // But if mirrored video, we see it on the right side of the screen?
                    // Actually, if I raise my right hand, and it's mirrored, it appears on the right side of the screen (viewer's right).
                    // Let's stick to the logic from Tempo Strike which seemed to work.
                    const isRight = classification.categoryName === 'Right';

                    // Index finger tip is landmark 8
                    const tip = landmarks[8];
                    const worldPos = mapHandToWorld(tip.x, tip.y);

                    if (isRight) {
                        newRight = worldPos;
                    } else {
                        newLeft = worldPos;
                    }
                }
            }

            // Smoothing
            const s = handPositionsRef.current;
            const LERP = 0.6;

            // Left
            if (newLeft) {
                if (s.left) {
                    newLeft.lerpVectors(s.left, newLeft, LERP);
                    if (deltaTime > 0.001) {
                        s.leftVelocity.subVectors(newLeft, s.left).divideScalar(deltaTime);
                    }
                }
                s.lastLeft = s.left ? s.left.clone() : newLeft.clone();
                s.left = newLeft;
            } else {
                s.left = null;
            }

            // Right
            if (newRight) {
                if (s.right) {
                    newRight.lerpVectors(s.right, newRight, LERP);
                    if (deltaTime > 0.001) {
                        s.rightVelocity.subVectors(newRight, s.right).divideScalar(deltaTime);
                    }
                }
                s.lastRight = s.right ? s.right.clone() : newRight.clone();
                s.right = newRight;
            } else {
                s.right = null;
            }
        };

        setupMediaPipe();

        return () => {
            isActive = false;
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
            }
            if (videoRef.current && videoRef.current.srcObject) {
                // Verify if it's indeed a MediaStream before stopping
                const srcObject = videoRef.current.srcObject;
                if ('getTracks' in srcObject) {
                    (srcObject as MediaStream).getTracks().forEach(t => t.stop());
                }
            }
        };
    }, [videoRef]);

    return { isCameraReady, handPositionsRef, lastResultsRef, error };
};
