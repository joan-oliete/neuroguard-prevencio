import React, { useEffect, useRef } from 'react';
import { HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface WebcamPreviewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    resultsRef: React.RefObject<HandLandmarkerResult | null>;
    isCameraReady: boolean;
}

const WebcamPreview: React.FC<WebcamPreviewProps> = ({ videoRef, resultsRef, isCameraReady }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isCameraReady) return;

        let animationFrameId: number;

        const render = () => {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (canvas && video && video.readyState === 4) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    // Draw video
                    ctx.save();
                    ctx.scale(-1, 1); // Mirror
                    ctx.translate(-canvas.width, 0);
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    ctx.restore();

                    // Draw Landmarks
                    if (resultsRef.current?.landmarks) {
                        for (const landmarks of resultsRef.current.landmarks) {
                            drawHand(ctx, landmarks, canvas.width, canvas.height);
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isCameraReady, resultsRef, videoRef]);

    return (
        <div className="absolute top-4 left-4 w-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-50 bg-black/50">
            <canvas ref={canvasRef} className="w-full h-full" />
            {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                    Initializing Camera...
                </div>
            )}
        </div>
    );
};

const drawHand = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff00';
    ctx.fillStyle = '#00ff00';

    for (const lm of landmarks) {
        // Handle mirroring calculation for drawing points on mirrored canvas
        // Since we mirrored the whole context for video, we need to be careful.
        // Actually, if we mirrored the context, we just draw normal x coords?
        // MediaPipe x is 0..1 normalized.
        // If we mirrored the context, drawing at x=0 (left) draws at right visual.
        // Let's just draw manually with calculation to avoid headache of double mirroring
        // or just rely on context flip.

        // simpler: context is flipped. So x=0.1 means left side of source, which becomes right side of canvas.
        // MediaPipe Keypoints are normalized 0-1.

        ctx.beginPath();
        ctx.arc(lm.x * width, lm.y * height, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
};

export default WebcamPreview;
