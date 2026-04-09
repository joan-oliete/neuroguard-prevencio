import React, { useState, useEffect, useRef } from 'react';

interface WeightKnobProps {
    weight: number;
    color: string;
    onChange: (newWeight: number) => void;
    size?: number;
    showLabel?: boolean;
}

export const WeightKnob: React.FC<WeightKnobProps> = ({
    weight,
    color,
    onChange,
    size = 64,
    showLabel = true
}) => {
    const knobRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Convert weight (0-1) to degrees (-135 to 135)
    // 0 = -135deg, 1 = 135deg
    // range = 270deg
    const angle = (weight * 270) - 135;

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !knobRef.current) return;

        const rect = knobRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate new value based on drag delta Y (simple version)
        // Or angular version:
        // const deltaY = prevY - e.clientY;
        // let newWeight = weight + (deltaY * 0.01);

        // Let's implement simple vertical drag behavior which is common for DAW knobs
        // Drag UP = increase, Drag DOWN = decrease
        const sensitivity = 0.005;
        const newValue = Math.max(0, Math.min(1, weight - (e.movementY * sensitivity)));

        onChange(newValue);
    };

    // Calculate arc path for SVG
    const radius = size * 0.4;
    const center = size / 2;
    // ... complex arc math skipped for MVP, using CSS rotation

    return (
        <div className="flex flex-col items-center gap-2 select-none touch-none">
            <div
                ref={knobRef}
                className="relative cursor-ns-resize group"
                style={{ width: size, height: size }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp} // Safety
            >
                {/* Background Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-800" />

                {/* Active Ring (Approximated with conic or just simple rotation indicator) */}
                <div
                    className="absolute inset-[10%] rounded-full shadow-lg transition-transform duration-75"
                    style={{
                        transform: `rotate(${angle}deg)`,
                        backgroundColor: '#1e293b'
                    }}
                >
                    {/* Indicator Dot */}
                    <div
                        className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-[0_0_10px_2px]"
                        style={{
                            backgroundColor: weight > 0 ? color : '#334155',
                            boxShadow: weight > 0 ? `0 0 10px ${color}` : 'none'
                        }}
                    />
                </div>

                {/* Center Label (optional) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-mono text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(weight * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
};
